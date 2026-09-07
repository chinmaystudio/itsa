import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, Html, Line, OrbitControls, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { Link } from "@tanstack/react-router";

import { readSceneColors, type SceneColors } from "@/lib/theme-colors";

import type { Member, TeamTree } from "@/server/team/types";

/* ───────────────────────── Scene model ───────────────────────── */

type V3 = [number, number, number];

type SceneNode = {
  id: string;
  label: string;
  sub?: string;
  kind: "root" | "branch" | "community" | "group" | "member";
  position: V3;
  parentId: string | null;
  member?: Member;
  communityId?: string;
  depth: number;
};

type HierarchyScene = {
  nodes: SceneNode[];
  byId: Map<string, SceneNode>;
  root: SceneNode;
  branches: SceneNode[];
  branchChildren: Map<string, SceneNode[]>;
  communities: SceneNode[];
  communityMembers: Map<string, SceneNode[]>;
};

const BRANCH_IDS = ["faculty", "core", "communities"] as const;
type BranchId = (typeof BRANCH_IDS)[number];

function memberNode(member: Member, position: V3, parentId: string): SceneNode {
  return {
    id: member.id,
    label: member.name,
    sub: member.position,
    kind: "member",
    position,
    parentId,
    member,
    depth: 3,
  };
}

function buildScene(tree: TeamTree, mobile: boolean): HierarchyScene {
  const nodes: SceneNode[] = [];
  const byId = new Map<string, SceneNode>();

  const add = (node: SceneNode) => {
    nodes.push(node);
    byId.set(node.id, node);
    return node;
  };

  const root = add({
    id: "root",
    label: "ITSA TEAM",
    sub: "2025–26 Tenure",
    kind: "root",
    position: [0, 3.4, 0],
    parentId: null,
    depth: 0,
  });

  // Portrait-friendly spacing: branches and grids tighten up on mobile so the
  // auto-framing camera always keeps the whole level inside the viewport.
  const branchPositions: Record<BranchId, V3> = mobile
    ? { faculty: [-4.4, 0.3, 0.6], core: [0, 0.3, 1.2], communities: [4.4, 0.3, 0.6] }
    : { faculty: [-7.4, 0.3, 0.8], core: [0, 0.3, 1.4], communities: [7.4, 0.3, 0.8] };

  const branches = BRANCH_IDS.map((branchId) => {
    const meta =
      branchId === "faculty"
        ? { name: "FACULTY", sub: `${tree.faculty.members.length} advisors` }
        : branchId === "core"
          ? { name: "CORE", sub: `${tree.core.members.length} office bearers` }
          : { name: "COMMUNITIES", sub: `${tree.communities.length} units` };
    return add({
      id: branchId,
      label: meta.name,
      sub: meta.sub,
      kind: "branch",
      position: branchPositions[branchId],
      parentId: "root",
      depth: 1,
    });
  });

  const branchChildren = new Map<string, SceneNode[]>();
  // Discrete spacing rule: horizontal gaps must comfortably exceed the widest
  // element in a row (slab 3.1 / label ≈ 2.2 world units) so nothing overlaps.
  branchChildren.set(
    "faculty",
    tree.faculty.members.map((member, i) =>
      add(
        memberNode(
          member,
          [
            branchPositions.faculty[0] - ((tree.faculty.members.length - 1) * 4.2) / 2 + i * 4.2,
            -1.7,
            0.2,
          ],
          "faculty",
        ),
      ),
    ),
  );

  const coreCols = mobile ? 2 : 4;
  const coreSpacingX = mobile ? 4.8 : 4.4;
  branchChildren.set(
    "core",
    tree.core.members.map((member, i) => {
      const col = i % coreCols;
      const row = Math.floor(i / coreCols);
      return add(
        memberNode(
          member,
          [
            branchPositions.core[0] + (col - (coreCols - 1) / 2) * coreSpacingX,
            -2.3 - row * 2.3,
            0.2,
          ],
          "core",
        ),
      );
    }),
  );

  const communityNodes = tree.communities.map((community, i) => {
    // Wide 4-up rows on desktop, 3-up on mobile — every block is isolated by
    // ≈2× its own width so labels never touch neighbouring slabs.
    const rowSize = mobile ? 3 : 4;
    const row = Math.floor(i / rowSize);
    const col = i % rowSize;
    const spacingX = mobile ? 5.0 : 6.2;
    const originX = branchPositions.communities[0];
    const position: V3 = [
      originX + (col - (rowSize - 1) / 2) * spacingX,
      -2.6 - row * 3.1,
      (mobile ? 0.6 : 0.8) - row * 0.5,
    ];
    return add({
      id: `community-${community.id}`,
      label: community.name,
      sub:
        community.lead.length + community.executives.length > 0
          ? `${community.lead.length + community.executives.length} members`
          : "roster pending",
      kind: "community",
      position,
      parentId: "communities",
      communityId: community.id,
      depth: 2,
    });
  });
  branchChildren.set("communities", communityNodes);
  const communityMembers = new Map<string, SceneNode[]>();
  for (const community of tree.communities) {
    const detailNodes: SceneNode[] = [];
    const focusId = `community-${community.id}`;

    // LEAD group on the left, EXECUTIVES group on the right — mirroring the
    // horizontal two-panel split of the 2D flowchart. Columns sit well past
    // twice the member slab width (2.5) so blocks never share pixels.
    const leadX = mobile ? -4.2 : -4.6;
    const execGroupX = mobile ? 3.2 : 4.6;
    const execCols = mobile ? 2 : 2;
    const execSpacingX = mobile ? 4.4 : 4.6;

    detailNodes.push(
      add({
        id: `lead-${community.id}`,
        label: "LEAD",
        kind: "group",
        position: [leadX, -1.2, 0.6],
        parentId: focusId,
        depth: 2,
      }),
      add({
        id: `exec-${community.id}`,
        label: "EXECUTIVES",
        kind: "group",
        position: [execGroupX, -1.2, 0.6],
        parentId: focusId,
        depth: 2,
      }),
    );

    community.lead.forEach((member, i) => {
      detailNodes.push(
        add(memberNode(member, [leadX, -3.4 - i * 2.3, 0.2], `lead-${community.id}`)),
      );
    });
    community.executives.forEach((member, i) => {
      const col = i % execCols;
      const row = Math.floor(i / execCols);
      detailNodes.push(
        add(
          memberNode(
            member,
            [
              execGroupX - ((execCols - 1) * execSpacingX) / 2 + col * execSpacingX,
              -3.4 - row * 2.3,
              0.2,
            ],
            `exec-${community.id}`,
          ),
        ),
      );
    });

    communityMembers.set(focusId, detailNodes);
  }

  return {
    nodes,
    byId,
    root,
    branches,
    branchChildren,
    communities: communityNodes,
    communityMembers,
  };
}

/* ───────────────────────── Visibility ───────────────────────── */

function visibleNodes(
  scene: HierarchyScene,
  expanded: ReadonlySet<string>,
): { nodes: SceneNode[]; dimmedIds: Set<string> } {
  const visible: SceneNode[] = [scene.root];
  const dimmedIds = new Set<string>();

  if (!expanded.has("root")) return { nodes: visible, dimmedIds };

  for (const branch of scene.branches) visible.push(branch);

  const openBranch = BRANCH_IDS.find((b) => expanded.has(b));
  if (!openBranch) return { nodes: visible, dimmedIds };

  if (openBranch === "communities") {
    const openCommunity = scene.communities.find((c) => expanded.has(c.id));
    if (openCommunity) {
      for (const node of scene.communityMembers.get(openCommunity.id) ?? []) {
        visible.push(node);
      }
      for (const community of scene.communities) {
        if (community.id !== openCommunity.id) dimmedIds.add(community.id);
      }
      visible.push(openCommunity);
    } else {
      for (const community of scene.communities) visible.push(community);
    }
  } else {
    for (const child of scene.branchChildren.get(openBranch) ?? []) visible.push(child);
  }

  return { nodes: visible, dimmedIds };
}

/* ───────────────────────── Camera rig ───────────────────────── */

interface ControlsLike {
  target: THREE.Vector3;
  update: () => void;
}

function centroidOf(nodes: SceneNode[]): V3 {
  if (nodes.length === 0) return [0, 1.5, 0];
  let x = 0;
  let y = 0;
  let z = 0;
  for (const node of nodes) {
    x += node.position[0];
    y += node.position[1];
    z += node.position[2];
  }
  return [x / nodes.length, y / nodes.length, z / nodes.length];
}

interface Framing {
  target: V3;
  /** Camera distance that fits every visible node inside the viewport. */
  distance: number;
}

function frameVisible(nodes: SceneNode[], fovDeg: number, aspect: number): Framing {
  const [cx, cy, cz] = centroidOf(nodes);
  let radius = 3;
  for (const node of nodes) {
    const dx = node.position[0] - cx;
    const dy = node.position[1] - cy;
    const dz = node.position[2] - cz;
    radius = Math.max(radius, Math.sqrt(dx * dx + dy * dy + dz * dz) + 1.7);
  }
  const vHalf = Math.tan((fovDeg * Math.PI) / 360);
  const hHalf = vHalf * (aspect > 0 ? aspect : 1);
  const half = Math.min(vHalf, hHalf);
  const distance = Math.min(48, Math.max(6, (radius / half) * 1.12 + 1.2));
  return { target: [cx, cy, cz], distance };
}

function CameraRig({
  framing,
  reduced,
  mobile,
}: {
  framing: Framing;
  reduced: boolean;
  mobile: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as unknown as ControlsLike | null;
  const gl = useThree((state) => state.gl);
  const desiredTarget = useRef(new THREE.Vector3(...framing.target));
  const desiredPosition = useRef(new THREE.Vector3());
  const transitioning = useRef(true);

  // On touch devices the camera moves itself per hierarchy state — no manual
  // dragging; one finger stays free for normal page scrolling.
  useEffect(() => {
    gl.domElement.style.touchAction = mobile ? "pan-y" : "none";
  }, [gl, mobile]);

  useEffect(() => {
    desiredTarget.current.set(...framing.target);
    // Keep the user's current viewing angle; just dolly out/in to the
    // distance that frames the cluster.
    const dir = new THREE.Vector3().subVectors(
      camera.position,
      controls ? controls.target : desiredTarget.current,
    );
    if (dir.lengthSq() < 0.01) dir.set(0, 0.32, 1);
    dir.normalize();
    desiredPosition.current.copy(desiredTarget.current).addScaledVector(dir, framing.distance);
    transitioning.current = true;
    if (reduced && controls) {
      camera.position.copy(desiredPosition.current);
      controls.target.copy(desiredTarget.current);
      controls.update();
      transitioning.current = false;
    }
  }, [framing, camera, controls, reduced]);

  useFrame((_, delta) => {
    if (!controls || !transitioning.current) return;
    const t = 1 - Math.exp(-6.5 * delta);
    controls.target.lerp(desiredTarget.current, t);
    camera.position.lerp(desiredPosition.current, t);
    controls.update();
    if (
      camera.position.distanceTo(desiredPosition.current) < 0.04 &&
      controls.target.distanceTo(desiredTarget.current) < 0.04
    ) {
      transitioning.current = false;
    }
  });

  return null;
}

/* ───────────────────────── Nodes & beams ───────────────────────── */

const SIZES: Record<SceneNode["kind"], V3> = {
  root: [5.4, 1.8, 0.9],
  branch: [3.7, 1.15, 0.75],
  community: [3.1, 1.0, 0.6],
  group: [2.2, 0.7, 0.5],
  member: [2.5, 0.85, 0.55],
};

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function NodeSlab({
  node,
  colors,
  isDimmed,
  isOnPath,
  expanded,
  index,
  reduced,
  onToggle,
}: {
  node: SceneNode;
  colors: SceneColors;
  isDimmed: boolean;
  isOnPath: boolean;
  expanded: boolean;
  index: number;
  reduced: boolean;
  onToggle: (node: SceneNode) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const size = SIZES[node.kind];
  const bornAt = useRef<number | null>(null);
  // Snappy entrance: tiny per-node stagger, fully assembled in ~0.45s.
  const delay = Math.min(0.3, node.depth * 0.07 + index * 0.018);

  useFrame(({ clock }) => {
    if (!group.current) return;
    if (reduced) {
      group.current.scale.setScalar(1);
      return;
    }
    if (bornAt.current === null) bornAt.current = clock.elapsedTime;
    const progress = Math.min(1, Math.max(0, (clock.elapsedTime - bornAt.current - delay) / 0.3));
    group.current.scale.setScalar(Math.max(0.001, easeOutBack(progress)));
    group.current.position.y =
      node.position[1] +
      (hovered && !isDimmed ? 0.14 : 0) +
      (node.kind === "root" ? Math.sin(clock.elapsedTime * 0.9) * 0.06 : 0);
  });

  const fill = isDimmed
    ? colors.surface
    : node.kind === "root" || isOnPath || hovered
      ? colors.primary
      : node.kind === "branch" || node.kind === "community"
        ? colors.foreground
        : colors.surface;
  const opacity = isDimmed ? 0.18 : 1;

  const active = node.kind === "root" || isOnPath || hovered;
  const labelTone = active
    ? "text-background"
    : node.kind === "branch" || node.kind === "community"
      ? "text-background"
      : "text-foreground";
  const labelBg = active
    ? "bg-primary"
    : node.kind === "branch" || node.kind === "community"
      ? "bg-foreground"
      : "bg-card border border-border";

  return (
    <group ref={group} position={node.position}>
      <mesh position={[0.16, -0.16, -0.14]}>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color={node.kind === "member" ? colors.primary : colors.foreground}
          transparent
          opacity={opacity * 0.9}
        />
      </mesh>
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          if (!isDimmed) {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (event.delta > 8 || isDimmed) return;
          onToggle(node);
        }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={fill}
          transparent
          opacity={opacity}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      <Html
        center
        distanceFactor={14}
        position={[0, 0, size[2] / 2 + 0.05]}
        zIndexRange={[30, 0]}
        className="select-none"
      >
        <button
          type="button"
          tabIndex={isDimmed ? -1 : 0}
          onClick={(event) => {
            event.stopPropagation();
            if (!isDimmed) onToggle(node);
          }}
          onMouseEnter={() => {
            if (!isDimmed) setHovered(true);
          }}
          onMouseLeave={() => setHovered(false)}
          aria-expanded={node.kind === "member" || node.kind === "group" ? undefined : expanded}
          aria-label={`${node.label}${node.sub ? ` — ${node.sub}` : ""}${
            node.kind === "member" || node.kind === "group"
              ? ""
              : expanded
                ? ", expanded"
                : ", press to expand"
          }`}
          className={`${labelBg} ${labelTone} block max-w-[190px] cursor-pointer px-2 py-1.5 text-center shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          <span className="block font-display text-[12px] font-extrabold leading-snug tracking-tight text-balance">
            {node.label}
          </span>
          {node.sub ? (
            <span className="mt-0.5 block font-mono text-[7px] uppercase tracking-[0.16em] whitespace-nowrap opacity-75">
              {node.sub}
            </span>
          ) : null}
        </button>
      </Html>
    </group>
  );
}

function Beams({
  scene,
  expanded,
  colors,
}: {
  scene: HierarchyScene;
  expanded: ReadonlySet<string>;
  colors: SceneColors;
}) {
  const beams = useMemo(() => {
    const { nodes: visible } = visibleNodes(scene, expanded);
    const pairs: { points: V3[]; strong: boolean }[] = [];
    for (const node of visible) {
      if (!node.parentId) continue;
      const parent = scene.byId.get(node.parentId);
      if (!parent) continue;
      const from = new THREE.Vector3(...parent.position);
      const to = new THREE.Vector3(...node.position);
      const mid = from.clone().lerp(to, 0.5);
      mid.y += 0.35;
      const points = new THREE.QuadraticBezierCurve3(from, mid, to)
        .getPoints(12)
        .map((p) => [p.x, p.y, p.z] as V3);
      pairs.push({ points, strong: expanded.has(node.id) });
    }
    return pairs;
  }, [scene, expanded]);

  return (
    <>
      {beams.map((beam, i) => (
        <Line
          key={`${beam.points[0]?.join(",")}-${i}`}
          points={beam.points}
          color={beam.strong ? colors.primary : colors.foreground}
          lineWidth={beam.strong ? 1.6 : 1}
          transparent
          opacity={beam.strong ? 0.85 : 0.28}
        />
      ))}
    </>
  );
}

/* ───────────────────────── Breadcrumb ───────────────────────── */

function breadcrumbPath(
  scene: HierarchyScene,
  expanded: ReadonlySet<string>,
): { id: string; label: string; target: string | null }[] {
  const openBranch = BRANCH_IDS.find((b) => expanded.has(b));
  const path: { id: string; label: string; target: string | null }[] = [
    { id: "root", label: "ITSA TEAM", target: openBranch !== undefined ? "root" : null },
  ];
  if (!openBranch) return path;
  const branchNode = scene.byId.get(openBranch);
  path.push({ id: openBranch, label: branchNode?.label ?? openBranch.toUpperCase(), target: null });

  if (openBranch === "communities") {
    const openCommunity = scene.communities.find((c) => expanded.has(c.id));
    if (openCommunity) {
      path.push({
        id: openCommunity.id,
        label: openCommunity.label,
        target: "communities",
      });
    }
  }
  return path;
}

/* ───────────────────────── Scene wrapper ───────────────────────── */

function SceneContents({
  scene,
  expanded,
  colors,
  reduced,
  onToggle,
  mobile,
}: {
  scene: HierarchyScene;
  expanded: ReadonlySet<string>;
  colors: SceneColors;
  reduced: boolean;
  onToggle: (node: SceneNode) => void;
  mobile: boolean;
}) {
  const { nodes, dimmedIds } = useMemo(() => visibleNodes(scene, expanded), [scene, expanded]);
  const pathIds = useMemo(() => {
    const ids = new Set<string>();
    for (const branch of BRANCH_IDS) if (expanded.has(branch)) ids.add(branch);
    for (const community of scene.communities) {
      if (expanded.has(community.id)) ids.add(community.id);
    }
    return ids;
  }, [scene, expanded]);

  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);

  // Auto-framing: the camera distance is derived from the bounding radius of
  // everything currently visible, so every hierarchy level always fits the
  // viewport — on wide desktops and narrow portrait phones alike.
  const framing = useMemo(
    () => frameVisible(nodes, camera.fov, size.width / Math.max(1, size.height)),
    [nodes, camera, size],
  );

  // Keep the mobile fov in sync even when the flag flips after mount.
  useEffect(() => {
    camera.fov = mobile ? 54 : 42;
    camera.updateProjectionMatrix();
  }, [camera, mobile]);

  return (
    <>
      <fog attach="fog" args={[colors.background, 24, 110]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[6, 10, 8]} intensity={1.6} />
      <pointLight position={[-10, 4, -6]} intensity={26} color={colors.primary} distance={30} />
      <hemisphereLight args={[colors.background, colors.foreground, 0.5]} />

      <Grid
        position={[0, -6.4, 0]}
        cellSize={1.6}
        cellThickness={0.6}
        cellColor={colors.border}
        sectionSize={8}
        sectionThickness={1}
        sectionColor={colors.primary}
        fadeDistance={90}
        fadeStrength={1.4}
        infiniteGrid
      />

      {!mobile && !reduced ? (
        <Sparkles
          count={64}
          scale={[22, 10, 14]}
          position={[0, 1, -4]}
          size={2.4}
          speed={0.25}
          color={colors.primary}
          opacity={0.5}
        />
      ) : null}

      <Beams scene={scene} expanded={expanded} colors={colors} />

      {nodes.map((node, index) => (
        <NodeSlab
          key={node.id}
          node={node}
          colors={colors}
          isDimmed={dimmedIds.has(node.id)}
          isOnPath={pathIds.has(node.id) && node.kind !== "root" && node.kind !== "member"}
          expanded={expanded.has(node.id)}
          index={index}
          reduced={reduced}
          onToggle={onToggle}
        />
      ))}

      <CameraRig framing={framing} reduced={reduced} mobile={mobile} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        enableRotate={!mobile}
        enableZoom={!mobile}
        minDistance={5}
        maxDistance={52}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0.6}
      />
    </>
  );
}

/* ───────────────────────── Public component ───────────────────────── */

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

export default function Hierarchy3D({
  tree,
  onSelectMember,
}: {
  tree: TeamTree;
  onSelectMember: (member: Member) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [colors, setColors] = useState<SceneColors>(() => readSceneColors());
  const [mobile, setMobile] = useState(false);
  const scene = useMemo(() => buildScene(tree, mobile), [tree, mobile]);

  useEffect(() => {
    setMounted(true);
    setSupported(webglAvailable());
    const mediaQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const updateMobile = () => setMobile(mediaQuery.matches);
    updateMobile();
    mediaQuery.addEventListener("change", updateMobile);

    const themeObserver = new MutationObserver(() => setColors(readSceneColors()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mediaQuery.removeEventListener("change", updateMobile);
      themeObserver.disconnect();
    };
  }, []);

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const toggle = (node: SceneNode) => {
    if (node.kind === "group") return;
    if (node.kind === "member" && node.member) {
      onSelectMember(node.member);
      return;
    }
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(node.id)) {
        next.delete(node.id);
        if (node.id === "root") {
          for (const branch of BRANCH_IDS) next.delete(branch);
          for (const community of scene.communities) next.delete(community.id);
        } else if (node.id === "communities") {
          for (const community of scene.communities) next.delete(community.id);
        }
        return next;
      }
      if (node.id === "root") {
        next.add("root");
        return next;
      }
      if (BRANCH_IDS.includes(node.id as BranchId)) {
        for (const branch of BRANCH_IDS) next.delete(branch);
        for (const community of scene.communities) next.delete(community.id);
        next.add(node.id);
        return next;
      }
      if (node.kind === "community") {
        next.add(node.id);
        return next;
      }
      return next;
    });
  };

  const crumbs = breadcrumbPath(scene, expanded);

  const jumpTo = (target: string) => {
    setExpanded(() => {
      if (target === "root") return new Set<string>(["root"]);
      const next = new Set<string>(["root"]);
      if (BRANCH_IDS.includes(target as BranchId)) {
        next.add(target);
        return next;
      }
      next.add("communities");
      next.add(target);
      return next;
    });
  };

  const stepBack = () => {
    setExpanded((current) => {
      const next = new Set(current);
      const openCommunity = scene.communities.find((c) => next.has(c.id));
      if (openCommunity) {
        next.delete(openCommunity.id);
        return next;
      }
      const openBranch = BRANCH_IDS.find((b) => next.has(b));
      if (openBranch) {
        next.delete(openBranch);
        return next;
      }
      next.delete("root");
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-3 pb-24 pt-6 sm:px-8">
      <nav
        aria-label="Hierarchy path"
        className="mb-4 flex flex-wrap items-center gap-2 px-2 font-mono text-[10px] uppercase tracking-[0.18em]"
      >
        {crumbs.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden className="text-muted-foreground">
                /
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => crumb.target !== null && jumpTo(crumb.target)}
              disabled={crumb.target === null}
              className={
                crumb.target === null
                  ? "bg-foreground px-2.5 py-1 text-background"
                  : "border border-border px-2.5 py-1 text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              }
            >
              {crumb.label}
            </button>
          </span>
        ))}
        {expanded.size > 0 ? (
          <button
            type="button"
            onClick={stepBack}
            className="ml-auto border border-border px-2.5 py-1 text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ← Back
          </button>
        ) : null}
      </nav>

      <div className="relative h-[68vh] min-h-[440px] overflow-hidden border border-border bg-surface">
        <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 opacity-60" />
        {mounted && supported ? (
          <Canvas
            camera={{ position: [0, 3.6, 12.5], fov: mobile ? 52 : 42 }}
            dpr={[1, mobile ? 1.5 : 2]}
            gl={{ antialias: true, alpha: true }}
            flat
            className="absolute inset-0"
          >
            <SceneContents
              scene={scene}
              expanded={expanded}
              colors={colors}
              reduced={reduced}
              onToggle={toggle}
              mobile={mobile}
            />
          </Canvas>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <p className="font-display text-xl font-bold text-foreground">
                {supported ? "Loading 3D scene…" : "3D preview unavailable"}
              </p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {supported
                  ? "Preparing the hierarchy renderer."
                  : "Your browser cannot display WebGL scenes."}
              </p>
              <Link
                to="/teams"
                search={{ mode: "chart" }}
                className="mt-5 inline-flex items-center gap-2 bg-foreground px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-background"
              >
                Open the 2D hierarchy instead →
              </Link>
            </div>
          </div>
        )}
        {!mounted && supported ? (
          <div className="absolute inset-0 grid place-items-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Loading 3D scene…
            </p>
          </div>
        ) : null}
      </div>

      <p className="mt-3 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {mobile
          ? "Tap a slab to expand · the camera moves automatically · scroll the page normally"
          : "Drag to orbit · scroll to zoom · click a slab to expand · click again to collapse"}
      </p>
    </div>
  );
}

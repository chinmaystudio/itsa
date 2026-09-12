import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitContactForm } from "@/lib/supabase";
import { itsa } from "@/data/itsa";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const [formResult, setFormResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const onSubmit = async (data: FormValues) => {
    try {
      await submitContactForm(data);

      await fetch("/api/auto-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }),
      }).catch((err) => console.warn("Auto-reply API notice:", err));

      setFormResult({
        type: "success",
        message: "Your message has been sent successfully! We'll get back to you within 24 hours.",
      });
      reset();
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setFormResult({
        type: "error",
        message: (error as Error)?.message || "Failed to send message. Please try again later.",
      });
    }
  };

  const contactChannels = [
    {
      icon: Mail,
      title: "Email Us",
      value: itsa.contact.email,
      href: `mailto:${itsa.contact.email}`,
      subtitle: "Official Student Association Inbox",
    },
    {
      icon: Phone,
      title: "Call Us",
      value: itsa.contact.phone,
      href: `tel:${itsa.contact.phone.replace(/[^0-9+]/g, "")}`,
      subtitle: "President & Faculty Co-ordinators",
    },
    {
      icon: MapPin,
      title: "Visit Campus",
      value: itsa.contact.address,
      href: "https://maps.google.com/?q=PCCoE+Pune",
      subtitle: "Information Technology Department",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8">
      {/* Masthead */}
      <header className="mb-16 border-b border-border pb-12">
        <div className="flex items-center gap-3">
          <span className="label-mono bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            05 // CONTACT
          </span>
          <span className="label-mono text-muted-foreground">GET IN TOUCH</span>
        </div>
        <h1 className="display-lg mt-4 max-w-4xl tracking-tight">
          CONNECT WITH THE <span className="text-primary">ITSA TEAM</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Have questions about upcoming events, hackathons, team memberships, or collaborations?
          Send us a message or reach out via our official communication channels.
        </p>
      </header>

      {/* Main Grid: Channels & Form */}
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        {/* Left Column: Direct Contact Info Cards */}
        <div className="space-y-6">
          <h2 className="display-md text-2xl font-bold">Contact Channels</h2>
          <p className="text-sm text-muted-foreground">
            Our student body leads and faculty advisors are available during working hours at PCCoE Pune campus.
          </p>

          <div className="space-y-4">
            {contactChannels.map((channel, i) => {
              const Icon = channel.icon;
              return (
                <motion.a
                  key={channel.title}
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="ink-card group block border border-border bg-surface p-6 transition-all duration-300 hover:border-primary hover:shadow-[4px_4px_0px_0px_var(--primary)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center border border-border bg-background group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="label-mono text-[10px] uppercase text-muted-foreground">
                        {channel.subtitle}
                      </p>
                      <h3 className="font-display text-xl font-bold">{channel.title}</h3>
                      <p className="font-mono text-sm font-semibold text-primary group-hover:underline">
                        {channel.value}
                      </p>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>

          {/* Department Operating Info */}
          <div className="ink-card border border-border bg-background p-6">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-primary" />
              <h3 className="font-display text-lg font-bold">Department Office Hours</h3>
            </div>
            <div className="mt-4 space-y-2 font-mono text-xs text-muted-foreground">
              <div className="flex justify-between border-b border-border pb-1">
                <span>Monday - Friday</span>
                <span className="font-bold text-foreground">9:00 AM - 5:00 PM IST</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span>Saturday</span>
                <span className="font-bold text-foreground">9:00 AM - 1:00 PM IST</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-muted-foreground">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="ink-card border border-border bg-surface p-8 sm:p-10 shadow-[6px_6px_0px_0px_var(--border)]">
          <div className="mb-8 border-b border-border pb-6">
            <h2 className="display-md text-3xl font-extrabold">Send a Message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill out the form below. An auto-confirmation email will be dispatched immediately.
            </p>
          </div>

          {formResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 text-center border ${
                formResult.type === "success"
                  ? "border-primary bg-primary/10"
                  : "border-destructive bg-destructive/10"
              }`}
            >
              <div className="mb-4 flex justify-center">
                {formResult.type === "success" ? (
                  <CheckCircle2 className="size-12 text-primary" />
                ) : (
                  <AlertCircle className="size-12 text-destructive" />
                )}
              </div>
              <h3 className="font-display text-2xl font-bold">
                {formResult.type === "success" ? "Message Sent Successfully!" : "Submission Failed"}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">{formResult.message}</p>
              <Button
                variant="outline"
                onClick={() => setFormResult(null)}
                className="mt-6 font-mono text-xs uppercase tracking-wider"
              >
                Send Another Message
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="label-mono text-xs uppercase">Your Name</Label>
                  <Input
                    id="contact-name"
                    placeholder="e.g. Rahul Sharma"
                    {...register("name")}
                    className={`font-mono text-sm rounded-none ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name ? (
                    <p className="text-[11px] font-medium text-destructive">{errors.name.message}</p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Full name as registered</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="label-mono text-xs uppercase">Email Address</Label>
                  <Input
                    id="contact-email"
                    placeholder="rahul@example.com"
                    type="email"
                    {...register("email")}
                    className={`font-mono text-sm rounded-none ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email ? (
                    <p className="text-[11px] font-medium text-destructive">{errors.email.message}</p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">We'll send auto-reply to this email</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-subject" className="label-mono text-xs uppercase">Subject</Label>
                <Input
                  id="contact-subject"
                  placeholder="e.g. Inquiry regarding Praxis Hackathon 2026"
                  {...register("subject")}
                  className={`font-mono text-sm rounded-none ${errors.subject ? "border-destructive" : ""}`}
                />
                {errors.subject ? (
                  <p className="text-[11px] font-medium text-destructive">{errors.subject.message}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Brief topic of your inquiry</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message" className="label-mono text-xs uppercase">Message</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Describe your inquiry, proposal, or feedback in detail..."
                  rows={5}
                  {...register("message")}
                  className={`font-mono text-sm rounded-none ${errors.message ? "border-destructive" : ""}`}
                />
                {errors.message ? (
                  <p className="text-[11px] font-medium text-destructive">{errors.message.message}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Minimum 10 characters required</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-mono text-sm uppercase tracking-widest py-6 gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending Message..."
                ) : (
                  <>
                    <Send className="size-4" /> Send Inquiry
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
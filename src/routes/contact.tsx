import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/supabase";
import { sendBrevoAutoReply } from "@/server/email";

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
    formState: { errors, isSubmitting, isSuccess },
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
      // Submit to Supabase
      await submitContactForm(data);

      // Send auto-reply email
      await sendBrevoAutoReply({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });

      setFormResult({
        type: "success",
        message: "Your message has been sent successfully! We'll get back to you soon.",
      });
      reset();
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setFormResult({
        type: "error",
        message:
          (error as Error)?.message ||
          "Failed to send message. Please try again later.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8">
      <header className="mb-12">
        <h1 className="display-md mb-6">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          Have questions, feedback, or want to collaborate? We'd love to hear from you!
        </p>
      </header>

      {formResult ? (
        <div className="mb-8 p-6 rounded-lg text-center">
          {formResult.type === "success" ? (
            <>
              <div className="mb-4">
                {/* Success icon */}
                <svg
                  className="h-8 w-8 mx-auto text-success"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mb-3">Message Sent Successfully!</h3>
              <p>{formResult.message}</p>
            </>
          ) : (
            <>
              <div className="mb-4">
                {/* Error icon */}
                <svg
                  className="h-8 w-8 mx-auto text-destructive"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8V12M12 16V12M12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mb-3">Oops! Something went wrong</h3>
              <p>{formResult.message}</p>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => setFormResult(null)}
            className="mt-4"
          >
            Close
          </Button>
        </div>
      ) : (
        <Form
          {...handleSubmit(onSubmit)}
          className="space-y-8"
          resetOnSubmit
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField>
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    {...register("name")}
                    className={errors.name ? "border-destructive" : undefined}
                  />
                  {errors.name && (
                    <FormMessage>{errors.name.message}</FormMessage>
                  )}
                </FormControl>
                <FormDescription>
                  Please enter your full name
                </FormDescription>
              </FormItem>
            </FormField>

            <FormField>
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email address"
                    type="email"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : undefined}
                  />
                  {errors.email && (
                    <FormMessage>{errors.email.message}</FormMessage>
                  )}
                </FormControl>
                <FormDescription>
                  We'll use this to respond to your inquiry
                </FormDescription>
              </FormItem>
            </FormField>
          </div>

          <FormField>
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="What's this regarding?"
                  {...register("subject")}
                  className={errors.subject ? "border-destructive" : undefined}
                />
                {errors.subject && (
                  <FormMessage>{errors.subject.message}</FormMessage>
                )}
              </FormControl>
              <FormDescription>
                Briefly describe the purpose of your message
              </FormDescription>
            </FormItem>
          </FormField>

          <FormField>
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type your message here..."
                  {...register("message")}
                  className={errors.message ? "border-destructive" : undefined}
                />
                {errors.message && (
                  <FormMessage>{errors.message.message}</FormMessage>
                )}
              </FormControl>
              <FormDescription>
                Please provide as much detail as possible
              </FormDescription>
            </FormItem>
          </FormField>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </Form>
      )}

      {/* Alternative contact info */}
      <section className="mt-16 border-t border-foreground/20 pt-12">
        <h2 className="mb-6">Or reach us directly</h2>
        <div className="grid gap-6 md:grid-cols-3 text-center">
          <div>
            <h3 className="mb-3">Email</h3>
            <p className="text-muted-foreground">
              <a href="mailto:nirjar.patil25@pccoepune.org">
                nirjar.patil25@pccoepune.org
              </a>
            </p>
          </div>
          <div>
            <h3 className="mb-3">Phone</h3>
            <p className="text-muted-foreground">
              <a href="tel:+919730726966">+91 9730726966</a>
            </p>
          </div>
          <div>
            <h3 className="mb-3">Office</h3>
            <p className="text-muted-foreground">
              Information Technology Department, PCCoE, Pune
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
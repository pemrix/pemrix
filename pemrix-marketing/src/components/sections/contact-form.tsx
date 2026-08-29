"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  company: z.string().optional(),
  topic: z.string().min(1, "Please choose a topic."),
  message: z.string().min(10, "Please enter at least 10 characters."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      topic: "",
      message: "",
    },
  });

  function onSubmit(values: ContactFormValues) {
    void values;
    setSubmitted(true);
    form.reset();
  }

  if (submitted) {
    return (
      <div className="border-border bg-card/40 flex min-h-[420px] flex-col items-center justify-center rounded-2xl border p-8 text-center">
        <h2 className="text-2xl font-medium tracking-tight">Message sent</h2>
        <p className="text-muted-foreground mt-3 max-w-sm leading-snug">
          Thanks for reaching out. Our team typically replies within one business day.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 h-11 rounded-full px-6"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border-border bg-card/40 space-y-5 rounded-2xl border p-6 md:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="What can we help with?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sales">Sales & demos</SelectItem>
                  <SelectItem value="support">Product support</SelectItem>
                  <SelectItem value="security">Security & compliance</SelectItem>
                  <SelectItem value="partnerships">Partnerships</SelectItem>
                  <SelectItem value="other">Something else</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Tell us about your team, stack, or question." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 w-full rounded-full text-base"
        >
          Send message
        </Button>
      </form>
    </Form>
  );
}

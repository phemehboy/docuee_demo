"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "",
    feature: "",
    subject: "",
    message: "",
    severity: "medium",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const DEMO_MODE = true; // or get this from props/env

  const handleSubmit = async () => {
    if (!form.type || !form.feature || !form.subject || !form.message) {
      toast.error("Error", {
        description: "Please fill all required fields",
      });
      return;
    }

    if (DEMO_MODE) {
      // ✅ Demo mode: just show toast
      toast.success(`Submitted (Demo)
Your support request has been simulated.`);

      // Reset form
      setForm({
        type: "",
        feature: "",
        subject: "",
        message: "",
        severity: "medium",
      });
      return;
    }

    // Real submission for non-demo
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      toast.success("Your support request has been sent");

      setForm({
        type: "",
        feature: "",
        subject: "",
        message: "",
        severity: "medium",
      });
    } catch {
      toast.error("Error", {
        description: "Failed to submit request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center px-2 md:px-4">
      <Card className="my-6 md:my-10 lg:my-12 w-full max-w-xl py-2 sm:py-4">
        <CardHeader>
          <CardTitle>Support Request</CardTitle>
          <CardDescription>
            Tell us what you’re facing and we’ll look into it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Issue Type */}
          <div className="space-y-2">
            <Label>Issue Type</Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm({ ...form, type: value })}
            >
              <SelectTrigger className="select-trigger">
                <SelectValue
                  placeholder="Select issue type"
                  className="placeholder:text-gray-400"
                />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="bug" className="select-item">
                  Bug
                </SelectItem>
                <SelectItem value="payment" className="select-item">
                  Payment / Withdrawal
                </SelectItem>
                <SelectItem value="confusion" className="select-item">
                  Confusion
                </SelectItem>
                <SelectItem value="feature" className="select-item">
                  Feature Request
                </SelectItem>
                <SelectItem value="other" className="select-item">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feature */}
          <div className="space-y-2">
            <Label>Where did this happen?</Label>
            <Input
              name="feature"
              placeholder="e.g. Withdrawal, Editor"
              value={form.feature}
              onChange={handleChange}
              className="placeholder:text-gray-400"
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              name="subject"
              placeholder="Short summary of the issue"
              value={form.subject}
              onChange={handleChange}
              className="placeholder:text-gray-400"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="message"
              placeholder="Please describe the issue in detail"
              value={form.message}
              onChange={handleChange}
              rows={5}
              className="placeholder:text-gray-400"
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>Severity</Label>
            <Select
              value={form.severity}
              onValueChange={(value) => setForm({ ...form, severity: value })}
            >
              <SelectTrigger className="select-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="low" className="select-item">
                  Low
                </SelectItem>
                <SelectItem value="medium" className="select-item">
                  Medium
                </SelectItem>
                <SelectItem value="high" className="select-item">
                  High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            className="w-full bg-blue-500 hover:bg-blue-700 cursor-pointer"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

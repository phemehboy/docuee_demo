"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle } from "lucide-react";
import Image from "next/image";

export function PrintHelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          title="How to remove browser headers & footers when printing"
        >
          <HelpCircle className="w-4 h-4" /> Print Help
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg sm:max-w-xl bg-white dark:bg-black-900 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-blue-700 dark:text-blue-400 break-words">
            Remove Browser Headers & Footers from Print
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          You can print the current content by clicking the{" "}
          <strong>print icon</strong> in the toolbar or by pressing{" "}
          <strong>Ctrl+P</strong> (Windows) / <strong>Cmd+P</strong> (Mac).
          <br />
          You can also <strong>print stage-by-stage</strong> from this screen.
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          By default, browsers add your app’s name, the page URL, date, and page
          numbers when printing. Follow the steps below to disable them in your
          browser’s print settings.
        </p>

        <Tabs defaultValue="chrome" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="chrome">
              <span className="mr-1">🟢</span> Chrome / Edge
            </TabsTrigger>
            <TabsTrigger value="firefox">
              <span className="mr-1">🟠</span> Firefox
            </TabsTrigger>
            <TabsTrigger value="safari">
              <span className="mr-1">🔵</span> Safari
            </TabsTrigger>
          </TabsList>

          {/* Chrome / Edge */}
          <TabsContent value="chrome" className="mt-3 space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Press <strong>Ctrl+P</strong> (Windows) or{" "}
                <strong>Cmd+P</strong> (Mac) to open the print dialog.
              </li>
              <li>
                Click <strong>More settings</strong> on the left.
              </li>
              <li>
                Uncheck <strong>Headers and footers</strong>.
              </li>
            </ol>
            <Image
              src="/print-instructions/chrome.png"
              alt="Chrome print settings example"
              width={450}
              height={280}
              className="rounded border"
            />
          </TabsContent>

          {/* Firefox */}
          <TabsContent value="firefox" className="mt-3 space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Press <strong>Ctrl+P</strong> (Windows) or{" "}
                <strong>Cmd+P</strong> (Mac).
              </li>
              <li>
                Click <strong>Options</strong>.
              </li>
              <li>
                Set all <strong>Headers & Footers</strong> fields to “Blank”.
              </li>
            </ol>
            <Image
              src="/print-instructions/firefox.png"
              alt="Firefox print settings example"
              width={450}
              height={280}
              className="rounded border"
            />
          </TabsContent>

          {/* Safari */}
          <TabsContent value="safari" className="mt-3 space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Press <strong>Cmd+P</strong> to open the print dialog.
              </li>
              <li>
                Uncheck <strong>Print headers and footers</strong> at the
                bottom.
              </li>
            </ol>
            <Image
              src="/print-instructions/safari.png"
              alt="Safari print settings example"
              width={450}
              height={280}
              className="rounded border"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

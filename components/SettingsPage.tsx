"use client";

import { useEffect, useRef, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { UserCog } from "lucide-react";
import { IUserClient } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import SupportBanner from "./SupportBanner";
import { toast } from "sonner";

interface Bank {
  name: string;
  code: string;
}

interface Props {
  initialUser: IUserClient;
}

const SettingsPage = ({ initialUser }: Props) => {
  const [user, setUser] = useState<IUserClient>(initialUser);
  const [saving, setSaving] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);

  const [payoutForm, setPayoutForm] = useState({
    bankName: "", // Display name (auto-filled for NG)
    bankCode: "", // Required for Paystack (NG only)
    accountNumber: "",
    accountName: "",
    currency: user?.country?.toLowerCase() === "ng" ? "NGN" : "USD",
  });

  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = async () => {
    if (!user || saving) return;

    setSaving(true);

    try {
      const newValue = !user.useCreditsAutomatically;

      const res = await fetch(`/api/users/${user._id}/toggle-credit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCreditsAutomatically: newValue }),
      });

      if (!res.ok) throw new Error("Failed to update preference");

      // ✅ Mutate the existing user (Mongoose document) safely
      user.useCreditsAutomatically = newValue;
      setUser(user);

      toast.success(
        `Automatic credit usage ${newValue ? "enabled" : "disabled"}.`,
      );
    } catch (error) {
      console.error("Error updating toggle:", error);
      toast.error("Error", {
        description: "Failed to update your credit usage preference.",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateEarningsPreference = async (preference: "credits" | "cash") => {
    if (saving) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user._id}/earnings-preference`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardPreference: preference }),
      });

      if (!res.ok) throw new Error("Failed");

      setUser((prev) => ({
        ...prev,
        rewardPreference: preference,
      }));

      toast.success(
        preference === "credits"
          ? "Future earnings will be saved as credits."
          : "Future earnings will be saved for withdrawal.",
      );
    } catch {
      toast.error("Error", {
        description: "Failed to update earnings preference.",
      });
    } finally {
      setSaving(false);
    }
  };

  const canRequestChange = ["student", "supervisor", "instructor"].includes(
    user?.userType ?? "",
  );

  const [searchTerm, setSearchTerm] = useState("");

  const isValidPayoutForm =
    payoutForm.bankName.trim().length >= 2 &&
    payoutForm.accountName.trim().length >= 3 &&
    /^\d{10}$/.test(payoutForm.accountNumber);

  const handleOpenPayoutDialog = () => {
    if (user?.payoutAccount) {
      setPayoutForm({
        bankName: user.payoutAccount.bankName || "",
        bankCode: user.payoutAccount.bankCode || "",
        accountNumber: user.payoutAccount.accountNumber || "",
        accountName: user.payoutAccount.accountName || "",
        currency:
          user.payoutAccount.currency ||
          (user?.country?.toLowerCase() === "ng" ? "NGN" : "USD"),
      });
    } else {
      setPayoutForm({
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountName: "",
        currency: user?.country?.toLowerCase() === "ng" ? "NGN" : "USD",
      });
    }

    setShowPayoutDialog(true);
  };

  useEffect(() => {
    // Only fetch banks for users who can withdraw
    if (
      !["supervisor", "instructor", "schoolAdmin"].includes(
        user?.userType || "",
      )
    )
      return;
    if (user?.country?.toLowerCase() !== "ng") return;

    const fetchBanks = async () => {
      try {
        setLoadingBanks(true);
        const res = await fetch("/api/banks/ng");
        const data = await res.json();
        setBanks(data);
      } catch (error) {
        console.error("Failed to fetch banks:", error);
        toast.error("Error", {
          description: "Failed to load bank list",
        });
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchBanks();
  }, [user?.country, user?.userType]);

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!user) {
    return (
      <main className="max-w-5xl mx-auto py-8 px-1 md:px-4 space-y-10">
        <section>
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-blue-900 dark:text-blue-300">
            ⚙️ Settings
          </h1>
          <p className="text-red-500">
            Failed to load your settings. Please try again later.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col max-w-6xl mx-auto">
      <div className="flex-1 py-2 md:p-4 lg:mt-4 space-y-6">
        {/* Header Section */}
        <section className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300">
            ⚙️Settings
          </h1>
        </section>

        {/* Subscription Section (Demo Only) */}
        {user && user.userType === "student" && (
          <section className="relative border border-dashed border-blue-400 px-2 py-4 md:p-6 rounded-md opacity-95">
            {/* Demo badge */}
            <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
              DEMO ONLY
            </span>

            <h2 className="text-xl font-semibold text-blue-500 mb-2">
              💳 Subscription (Demo)
            </h2>

            <p className="text-gray-400 mb-4">
              Current plan:
              <span className="ml-2 font-bold text-green-500">
                {user.subscriptionType}
              </span>
            </p>

            <Toggle
              label="Use credits automatically for subscription payments"
              checked={Boolean(user.useCreditsAutomatically)}
              disabled
              onChange={() => {}}
            />

            <p className="text-sm text-gray-400 mt-2 ml-1">
              This toggle is disabled in demo mode.
            </p>

            <p className="mt-3 text-sm text-blue-400">
              <strong>Credit Balance:</strong>{" "}
              <span className="text-green-500">
                {user.creditBalance?.toLocaleString()}
              </span>
            </p>

            <div className="mt-4 rounded bg-blue-950/40 p-3 text-xs text-blue-300">
              This subscription system is a demo. Payments, renewals, and
              submissions are intentionally disabled.
            </div>
          </section>
        )}

        {/* Earnings & Payouts Section */}
        {["supervisor", "instructor", "schoolAdmin"].includes(
          user.userType,
        ) && (
          <section className="border border-blue-200 dark:border-blue-700 px-2 py-4 md:p-6 rounded-md">
            <h2 className="text-xl font-semibold text-blue-500">
              💰 Earnings & Payouts
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Control how your referral bonuses and fine earnings are used.
            </p>

            {/* Summary */}
            <div className="mt-4 space-y-1 text-sm text-gray-400">
              <p>
                <strong>Credit Balance:</strong>{" "}
                <span className="text-green-500">
                  {user?.creditBalance?.toLocaleString()}
                </span>
              </p>
              <p>
                <strong>Withdrawable Earnings:</strong>{" "}
                <span className="text-yellow-500">
                  {user.withdrawableEarnings?.toLocaleString() || 0}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Minimum withdrawal: 30,000 credits
              </p>
            </div>

            {/* Preference */}
            <div className="mt-6 space-y-3">
              <p className="font-medium text-sm">Earnings Preference</p>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={user.rewardPreference === "credits"}
                  onChange={() => updateEarningsPreference("credits")}
                />
                <span className="text-sm text-gray-300">
                  Use earnings as credits (recommended)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={user.rewardPreference === "cash"}
                  onChange={() => updateEarningsPreference("cash")}
                />
                <span className="text-sm text-gray-300">
                  Withdraw earnings as cash
                </span>
              </label>

              <p className="text-xs text-gray-500 mt-2">
                Credits can be used for subscriptions and future features. Cash
                withdrawals are processed manually.
              </p>
            </div>

            {user.rewardPreference === "cash" && (
              <>
                {!["ng", "nigeria"].includes(
                  user?.country?.toLowerCase() || "",
                ) ? (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-lg font-semibold text-white">
                      International withdrawals coming soon 🌍
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Withdrawals to international bank accounts are not
                      available yet. Your earnings are safely stored as credits
                      and will be withdrawable once international payouts are
                      enabled.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 border-t border-blue-800 pt-4">
                    <h3 className="text-sm font-medium text-gray-300">
                      💳 Payout Account
                    </h3>

                    {user.payoutAccount?.accountNumber ? (
                      <div className="mt-2 text-sm text-gray-400 space-y-1">
                        <p>
                          <strong>Bank:</strong> {user.payoutAccount.bankName}
                        </p>
                        <p>
                          <strong>Account:</strong> ****
                          {user.payoutAccount.accountNumber.slice(-4)}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          {user.payoutAccount.verified ? (
                            <span className="text-green-500">Verified</span>
                          ) : (
                            <span className="text-yellow-500">
                              Pending verification
                            </span>
                          )}
                        </p>

                        <button
                          onClick={handleOpenPayoutDialog}
                          className="mt-2 text-xs text-blue-400 underline"
                        >
                          Edit payout account
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-gray-400">
                        <p>No payout account added.</p>
                        <button
                          onClick={() => setShowPayoutDialog(true)}
                          className="mt-2 text-xs text-blue-400 underline"
                        >
                          Add payout account
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Security Section */}
        <section className="border border-blue-200 dark:border-blue-700 px-2 py-4 md:p-6 rounded-md ">
          <h2 className="text-xl font-semibold text-blue-500">
            🔐 Security Settings
          </h2>
          <p className="text-gray-400 text-sm mt-2">Coming soon!</p>
        </section>

        {/* Account Section */}
        <section className="border border-blue-200 dark:border-blue-700 px-2 py-4 md:p-6 rounded-md ">
          <h2 className="text-xl font-semibold text-blue-500 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-yellow-500" />
            Account Settings
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Use the user button at the top to manage your account settings.
          </p>
        </section>
        {showPayoutDialog && (
          <Dialog open onOpenChange={setShowPayoutDialog}>
            <DialogContent className="bg-black-900">
              <DialogHeader>
                <DialogTitle>Payout Account Details</DialogTitle>
                <DialogDescription>
                  This account will be used for all withdrawals.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-4">
                {/* Bank selection / input */}
                {["ng", "nigeria"].includes(
                  user?.country?.toLowerCase() || "",
                ) ? (
                  <>
                    <Select
                      value={payoutForm.bankCode || ""}
                      onValueChange={(value) => {
                        const bank = banks.find((b) => b.code === value);
                        if (!bank) return;

                        setPayoutForm({
                          ...payoutForm,
                          bankCode: bank.code,
                          bankName: bank.name,
                        });
                      }}
                    >
                      <SelectTrigger className="select-trigger">
                        <SelectValue
                          placeholder={
                            loadingBanks ? "Loading banks..." : "Select Bank"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent className="select-content max-h-60 overflow-y-auto">
                        {/* Search Input - Keep it mounted */}
                        <div
                          className="px-2 py-2 sticky top-0 bg-black z-10"
                          onKeyDown={(e) => e.stopPropagation()} // Prevent Radix typeahead
                        >
                          <input
                            ref={searchInputRef}
                            key="search-input" // Important: ensures React keeps this input
                            type="text"
                            placeholder="Search bank..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-2 py-1 rounded-md bg-gray-800 text-white placeholder-gray-400 outline-none"
                            autoFocus
                          />
                        </div>

                        {/* No Banks Found */}
                        {filteredBanks.length === 0 && (
                          <SelectItem
                            key="no-bank"
                            value="__no_bank__"
                            disabled
                          >
                            <span className="text-gray-400">No bank found</span>
                          </SelectItem>
                        )}

                        {/* Render filtered banks */}
                        {filteredBanks.map((bank, index) => (
                          <SelectItem
                            key={`${bank.code}-${index}`}
                            value={bank.code}
                            className="truncate select-item"
                          >
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {!payoutForm.bankCode && (
                      <p className="text-xs text-red-500">
                        Please select a bank
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="Bank Name"
                      value={payoutForm.bankName}
                      onChange={(e) =>
                        setPayoutForm({
                          ...payoutForm,
                          bankName: e.target.value,
                        })
                      }
                    />
                    {payoutForm.bankName &&
                      payoutForm.bankName.trim().length < 2 && (
                        <p className="text-xs text-red-500">
                          Bank name is too short
                        </p>
                      )}
                  </>
                )}

                <Input
                  placeholder="Account Number"
                  value={payoutForm.accountNumber}
                  onChange={(e) =>
                    setPayoutForm({
                      ...payoutForm,
                      accountNumber: e.target.value.replace(/\D/g, ""), // digits only
                    })
                  }
                  maxLength={10}
                />
                {payoutForm.accountNumber &&
                  !/^\d{10}$/.test(payoutForm.accountNumber) && (
                    <p className="text-xs text-red-500">
                      Account number must be 10 digits
                    </p>
                  )}

                <Input
                  placeholder="Account Name"
                  value={payoutForm.accountName}
                  onChange={(e) =>
                    setPayoutForm({
                      ...payoutForm,
                      accountName: e.target.value,
                    })
                  }
                />
                {payoutForm.accountName &&
                  payoutForm.accountName.length < 3 && (
                    <p className="text-xs text-red-500">
                      Account name is too short
                    </p>
                  )}
              </div>

              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setShowPayoutDialog(false)}
                  className="bg-red-500 hover:bg-red-700"
                >
                  Cancel
                </Button>

                <Button
                  disabled={
                    !isValidPayoutForm ||
                    !["ng", "nigeria"].includes(
                      user?.country?.toLowerCase() || "",
                    )
                  }
                  onClick={async () => {
                    try {
                      setPayoutLoading(true);
                      const res = await fetch(
                        `/api/users/${user._id}/payout-account`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payoutForm),
                        },
                      );

                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message);

                      toast.success(
                        "Payout account verified and saved successfully.",
                      );

                      setShowPayoutDialog(false);
                      window.location.reload();
                    } catch (err: any) {
                      toast.error("Error", {
                        description:
                          err.message || "Failed to save payout account.",
                      });
                    } finally {
                      setPayoutLoading(false); // stop loading
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-700"
                >
                  {payoutLoading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <SupportBanner
        link={`/user/${initialUser._id}/usertype/${initialUser.userType}/dashboard/support`}
      />
    </main>
  );
};

export default SettingsPage;

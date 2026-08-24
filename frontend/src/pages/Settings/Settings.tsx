import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-toastify";
import api from "../../api/axious";

interface SettingsData {
  restaurantName: string;
  logoUrl?: string;
  initials?: string;
  restaurantAddress: string;
  phone: string;
  email: string;
  currency: string;
  gstNumber: string;
  gstPercentage: number;
  serviceChargePercentage: number;
  openingTime: string;
  closingTime: string;
  invoiceFooter: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const response = await api.get("/settings");
        setSettings(response.data.data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    getSettings();
  }, []);

  const updateField = <K extends keyof SettingsData>(
    field: K,
    value: SettingsData[K],
  ) => {
    setSettings((currentSettings) =>
      currentSettings
        ? { ...currentSettings, [field]: value }
        : currentSettings,
    );
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!settings) {
      return;
    }

    try {
      setSaving(true);
      const response = await api.patch("/settings", settings);
      setSettings(response.data.data);
      window.dispatchEvent(
        new CustomEvent("settings-updated", {
          detail: {
            restaurantName: response.data.data.restaurantName,
            logoUrl: response.data.data.logoUrl || "",
            initials: response.data.data.initials || "",
          },
        }),
      );
      toast.success("Settings updated successfully.");
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file || !settings) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setSettings({
        ...settings,
        logoUrl: result,
        initials: settings.initials || "",
      });
    };

    reader.readAsDataURL(file);
  };

  if (loading) {
    return <p className="text-gray-500">Loading settings...</p>;
  }

  if (!settings) {
    return <p className="text-red-600">Unable to load settings.</p>;
  }

  return (
    <form onSubmit={saveSettings} className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Restaurant and billing details
          </p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <section className="mt-6 border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Restaurant Brand
              </p>
              <p className="text-xs text-gray-500">
                Upload a logo, or leave it blank to use initials.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Upload Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="Initials"
              value={settings.initials || ""}
              onChange={(value) =>
                updateField("initials", value.slice(0, 3).toUpperCase())
              }
              placeholder="WP"
            />
            <div className="flex items-end">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 text-lg font-bold text-gray-700">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Restaurant logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (settings.initials || "WP").slice(0, 2).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Restaurant Name"
            value={settings.restaurantName}
            onChange={(value) => updateField("restaurantName", value)}
          />
          <Field
            label="Phone"
            value={settings.phone}
            onChange={(value) => updateField("phone", value)}
          />
          <Field
            label="Email"
            type="email"
            value={settings.email}
            onChange={(value) => updateField("email", value)}
          />
          <Field
            label="Currency"
            value={settings.currency}
            onChange={(value) => updateField("currency", value)}
          />
          <Field
            label="GST Number"
            value={settings.gstNumber}
            onChange={(value) => updateField("gstNumber", value)}
          />
          <Field
            label="GST Percentage"
            type="number"
            min="0"
            value={settings.gstPercentage}
            onChange={(value) => updateField("gstPercentage", Number(value))}
          />
          <Field
            label="Service Charge Percentage"
            type="number"
            min="0"
            value={settings.serviceChargePercentage}
            onChange={(value) =>
              updateField("serviceChargePercentage", Number(value))
            }
          />
          <Field
            label="Opening Time"
            type="time"
            value={settings.openingTime}
            onChange={(value) => updateField("openingTime", value)}
          />
          <Field
            label="Closing Time"
            type="time"
            value={settings.closingTime}
            onChange={(value) => updateField("closingTime", value)}
          />

          <TextArea
            label="Restaurant Address"
            value={settings.restaurantAddress}
            onChange={(value) => updateField("restaurantAddress", value)}
          />
          <TextArea
            label="Invoice Footer"
            value={settings.invoiceFooter}
            onChange={(value) => updateField("invoiceFooter", value)}
          />
        </div>
      </section>
    </form>
  );
};

interface FieldProps {
  label: string;
  type?: "email" | "number" | "text" | "time";
  min?: string;
  value: string | number;
  placeholder?: string;
  onChange: (value: string) => void;
}

const Field = ({
  label,
  type = "text",
  min,
  value,
  placeholder,
  onChange,
}: FieldProps) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    <input
      type={type}
      min={min}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      required
      className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-gray-900"
    />
  </label>
);

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TextArea = ({ label, value, onChange }: TextAreaProps) => (
  <label className="block text-sm font-medium text-gray-700 md:col-span-2">
    {label}
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
      rows={3}
      className="mt-2 w-full resize-y border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-gray-900"
    />
  </label>
);

export default Settings;

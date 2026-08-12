import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-toastify";
import api from "../../api/axious";

interface SettingsData {
  restaurantName: string;
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
      currentSettings ? { ...currentSettings, [field]: value } : currentSettings,
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
          detail: { restaurantName: response.data.data.restaurantName },
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
          <p className="mt-1 text-sm text-gray-500">Restaurant and billing details</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <section className="mt-6 border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Restaurant Name" value={settings.restaurantName} onChange={(value) => updateField("restaurantName", value)} />
          <Field label="Phone" value={settings.phone} onChange={(value) => updateField("phone", value)} />
          <Field label="Email" type="email" value={settings.email} onChange={(value) => updateField("email", value)} />
          <Field label="Currency" value={settings.currency} onChange={(value) => updateField("currency", value)} />
          <Field label="GST Number" value={settings.gstNumber} onChange={(value) => updateField("gstNumber", value)} />
          <Field label="GST Percentage" type="number" min="0" value={settings.gstPercentage} onChange={(value) => updateField("gstPercentage", Number(value))} />
          <Field label="Service Charge Percentage" type="number" min="0" value={settings.serviceChargePercentage} onChange={(value) => updateField("serviceChargePercentage", Number(value))} />
          <Field label="Opening Time" type="time" value={settings.openingTime} onChange={(value) => updateField("openingTime", value)} />
          <Field label="Closing Time" type="time" value={settings.closingTime} onChange={(value) => updateField("closingTime", value)} />

          <TextArea label="Restaurant Address" value={settings.restaurantAddress} onChange={(value) => updateField("restaurantAddress", value)} />
          <TextArea label="Invoice Footer" value={settings.invoiceFooter} onChange={(value) => updateField("invoiceFooter", value)} />
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
  onChange: (value: string) => void;
}

const Field = ({ label, type = "text", min, value, onChange }: FieldProps) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    <input
      type={type}
      min={min}
      value={value}
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

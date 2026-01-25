import React, { useMemo, useState } from 'react';
import { getUser, updateUser } from '../data/database';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
const ATHLETICISM = ['Low', 'Average', 'High'];

function clampInt(value, min, max) {
  const n = Number.parseInt(String(value || ''), 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export default function Profile({ userId, onDone }) {
  const user = useMemo(() => getUser(userId), [userId]);

  const [form, setForm] = useState(() => ({
    name: user?.name || '',
    age: user?.age ?? '',
    height: user?.height ?? '',
    weight: user?.weight ?? '',
    skillLevel: user?.skillLevel || SKILL_LEVELS[0],
    athleticism: user?.athleticism || ATHLETICISM[1],
    injuries: user?.injuries || '',
    isPremium: Boolean(user?.isPremium),
  }));

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    updateUser(userId, {
      name: form.name.trim(),
      age: clampInt(form.age, 5, 99),
      height: form.height,
      weight: form.weight,
      skillLevel: form.skillLevel,
      athleticism: form.athleticism,
      injuries: form.injuries,
      isPremium: Boolean(form.isPremium),
    });
    onDone?.();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-600 mt-1">View and edit your info anytime (no need to restart onboarding).</p>
        </div>
        <button
          onClick={onDone}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="w-full p-3 border rounded-lg"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg"
              value={form.age}
              onChange={(e) => updateField('age', e.target.value)}
              placeholder="e.g., 18"
              min={5}
              max={99}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={form.height}
              onChange={(e) => updateField('height', e.target.value)}
              placeholder="e.g., 6'1&quot; or 185 cm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Weight</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={form.weight}
              onChange={(e) => updateField('weight', e.target.value)}
              placeholder="e.g., 170 lb or 77 kg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Skill level</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={form.skillLevel}
              onChange={(e) => updateField('skillLevel', e.target.value)}
            >
              {SKILL_LEVELS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Athleticism</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={form.athleticism}
              onChange={(e) => updateField('athleticism', e.target.value)}
            >
              {ATHLETICISM.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Injuries / limitations</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={3}
            value={form.injuries}
            onChange={(e) => updateField('injuries', e.target.value)}
            placeholder="e.g., sore knee, ankle sprain, back tightness"
          />
        </div>

        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border">
          <div>
            <div className="font-semibold">Premium</div>
            <div className="text-sm text-gray-600">Unlock up to 20 current goals.</div>
          </div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPremium}
              onChange={(e) => updateField('isPremium', e.target.checked)}
            />
            <span className="text-sm">Enable</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onDone}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
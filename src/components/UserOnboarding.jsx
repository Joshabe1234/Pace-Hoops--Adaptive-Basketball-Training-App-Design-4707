import React, { useState } from 'react';
import { createUser } from '../data/database';

export default function UserOnboarding({ onComplete }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    skillLevel: 'intermediate',
    athleticism: 'average',
    injuries: 'none',
  });

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const user = createUser({
      ...form,
      age: Number(form.age),
      height: form.height ? Number(form.height) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
    });
    onComplete(user);
  };

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Welcome to Pace Hoops</h1>
      <p className="text-gray-400 mb-6">Enter your baseline info (no level selection needed).</p>

      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full p-3 rounded bg-gray-800"
          placeholder="Name"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-gray-800"
          placeholder="Age"
          type="number"
          value={form.age}
          onChange={(e) => onChange('age', e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            className="w-full p-3 rounded bg-gray-800"
            placeholder="Height (inches)"
            type="number"
            value={form.height}
            onChange={(e) => onChange('height', e.target.value)}
          />
          <input
            className="w-full p-3 rounded bg-gray-800"
            placeholder="Weight (lbs)"
            type="number"
            value={form.weight}
            onChange={(e) => onChange('weight', e.target.value)}
          />
        </div>

        <select
          className="w-full p-3 rounded bg-gray-800"
          value={form.skillLevel}
          onChange={(e) => onChange('skillLevel', e.target.value)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          className="w-full p-3 rounded bg-gray-800"
          value={form.athleticism}
          onChange={(e) => onChange('athleticism', e.target.value)}
        >
          <option value="below-average">Below Average</option>
          <option value="average">Average</option>
          <option value="above-average">Above Average</option>
        </select>

        <input
          className="w-full p-3 rounded bg-gray-800"
          placeholder="Injuries (or 'none')"
          value={form.injuries}
          onChange={(e) => onChange('injuries', e.target.value)}
        />

        <button className="w-full p-3 rounded bg-indigo-600 hover:bg-indigo-500">
          Continue
        </button>
      </form>
    </div>
  );
}
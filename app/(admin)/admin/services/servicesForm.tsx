'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  upsertServices,
  addServiceItem,
  updateServiceItem,
  deleteServiceItem,
} from '@/libs/actions/service';
import type { IServices, IService } from '@/libs/models/service';

type Props = { initialData: Partial<IServices> | null };

type ServiceItemWithId = IService & { _id?: string };

export default function ServicesForm({ initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [section, setSection] = useState({
    sectionTitle: initialData?.sectionTitle || '',
    sectionSubtitle: initialData?.sectionSubtitle || '',
    sectionDescription: initialData?.sectionDescription || '',
    isPublished: initialData?.isPublished ?? false,
  });

  const [items, setItems] = useState<ServiceItemWithId[]>(
    (initialData?.services as ServiceItemWithId[]) || []
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<IService>>({
    title: '', description: '', icon: '', link: '', isVisible: true,
  });
  const [showAdd, setShowAdd] = useState(false);

  function notify(success: boolean, msg: string) {
    setIsError(!success);
    setMessage(msg);
  }

  function handleSectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    startTransition(async () => {
      const res = await upsertServices(section);
      notify(res.success, res.message);
    });
  }

  function handleAdd() {
    if (!newItem.title?.trim()) return;
    startTransition(async () => {
      const res = await addServiceItem({
        title: newItem.title!,
        description: newItem.description,
        icon: newItem.icon,
        link: newItem.link,
        isVisible: newItem.isVisible ?? true,
      });
      notify(res.success, res.message);
      if (res.success) {
        setNewItem({ title: '', description: '', icon: '', link: '', isVisible: true });
        setShowAdd(false);
      }
    });
  }

  function handleUpdate(item: ServiceItemWithId) {
    if (!item._id) return;
    startTransition(async () => {
      const res = await updateServiceItem(item._id!, {
        title: item.title,
        description: item.description,
        icon: item.icon,
        link: item.link,
        isVisible: item.isVisible,
      });
      notify(res.success, res.message);
      if (res.success) setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteServiceItem(id);
      notify(res.success, res.message);
      if (res.success) setItems((prev) => prev.filter((i) => i._id !== id));
    });
  }

  function handleToggleVisible(item: ServiceItemWithId) {
    if (!item._id) return;
    startTransition(async () => {
      const res = await updateServiceItem(item._id!, { isVisible: !item.isVisible });
      notify(res.success, res.message);
      if (res.success)
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, isVisible: !i.isVisible } : i))
        );
    });
  }

  return (
    <div className="space-y-5">

      {/* Section Info */}
      <form onSubmit={handleSectionSubmit} className="space-y-5">
        <Card label="Section Info" accent="teal">
          <div className="space-y-4">
            <Field label="Section Title *">
              <input
                type="text"
                value={section.sectionTitle}
                onChange={(e) => setSection((p) => ({ ...p, sectionTitle: e.target.value }))}
                className="field-input"
                placeholder="Our Services"
                required
              />
            </Field>
            <Field label="Subtitle">
              <input
                type="text"
                value={section.sectionSubtitle}
                onChange={(e) => setSection((p) => ({ ...p, sectionSubtitle: e.target.value }))}
                className="field-input"
                placeholder="What we offer"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={section.sectionDescription}
                onChange={(e) => setSection((p) => ({ ...p, sectionDescription: e.target.value }))}
                className="field-input min-h-20 resize-y"
                placeholder="Brief intro about your services"
              />
            </Field>
          </div>
        </Card>

        {/* Publishing */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-gray-800">Publish Services Section</p>
            <p className="text-xs text-gray-400">Make this section visible on the live site</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={section.isPublished}
              onChange={(e) => setSection((p) => ({ ...p, isPublished: e.target.checked }))}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-teal-600 peer-focus:ring-2 peer-focus:ring-teal-400 peer-focus:ring-offset-1" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        {message && (
          <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            <span>{isError ? '✕' : '✓'}</span>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Section Info'}
        </button>
      </form>

      {/* Service Items */}
      <Card label="Service Items" accent="violet">
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">No services yet. Add one below.</p>
          )}

          {items.map((item) =>
            editingId === item._id ? (
              <div key={item._id} className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/40 p-4">
                <Field label="Title *">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => setItems((prev) => prev.map((i) => i._id === item._id ? { ...i, title: e.target.value } : i))}
                    className="field-input"
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => setItems((prev) => prev.map((i) => i._id === item._id ? { ...i, description: e.target.value } : i))}
                    className="field-input min-h-16 resize-y"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Icon">
                    <input
                      type="text"
                      value={item.icon || ''}
                      onChange={(e) => setItems((prev) => prev.map((i) => i._id === item._id ? { ...i, icon: e.target.value } : i))}
                      className="field-input"
                      placeholder="icon-name or URL"
                    />
                    <IconPreview value={item.icon} />
                  </Field>
                  <Field label="Link">
                    <input
                      type="text"
                      value={item.link || ''}
                      onChange={(e) => setItems((prev) => prev.map((i) => i._id === item._id ? { ...i, link: e.target.value } : i))}
                      className="field-input"
                      placeholder="/services/..."
                    />
                  </Field>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(item)}
                    disabled={isPending}
                    className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={item._id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">{item.title}</p>
                  {item.description && (
                    <p className="truncate text-xs text-gray-400">{item.description}</p>
                  )}
                </div>
                {/* Visibility toggle */}
                <label className="relative inline-flex cursor-pointer items-center" title={item.isVisible ? 'Visible' : 'Hidden'}>
                  <input
                    type="checkbox"
                    checked={item.isVisible}
                    onChange={() => handleToggleVisible(item)}
                    className="peer sr-only"
                    disabled={isPending}
                  />
                  <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-teal-600" />
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </label>
                <button
                  onClick={() => setEditingId(item._id!)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id!)}
                  disabled={isPending}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )
          )}

          {/* Add new */}
          {showAdd ? (
            <div className="space-y-3 rounded-xl border border-dashed border-teal-300 bg-teal-50/30 p-4">
              <Field label="Title *">
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
                  className="field-input"
                  placeholder="Service name"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                  className="field-input min-h-16 resize-y"
                  placeholder="Brief description"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Icon">
                  <input
                    type="text"
                    value={newItem.icon || ''}
                    onChange={(e) => setNewItem((p) => ({ ...p, icon: e.target.value }))}
                    className="field-input"
                    placeholder="icon-name or URL"
                  />
                  <IconPreview value={newItem.icon} />
                </Field>
                <Field label="Link">
                  <input
                    type="text"
                    value={newItem.link || ''}
                    onChange={(e) => setNewItem((p) => ({ ...p, link: e.target.value }))}
                    className="field-input"
                    placeholder="/services/..."
                  />
                </Field>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={isPending || !newItem.title?.trim()}
                  className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  Add Service
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-teal-400 hover:text-teal-700"
            >
              + Add Service
            </button>
          )}
        </div>
      </Card>

    </div>
  );
}

const ACCENT_CLASSES: Record<string, string> = {
  teal:   'border-teal-400 text-teal-700 bg-teal-50',
  violet: 'border-violet-400 text-violet-700 bg-violet-50',
};

function Card({ label, accent = 'teal', children }: { label: string; accent?: string; children: React.ReactNode }) {
  const cls = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.teal;
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className={`border-b px-6 py-3 ${cls}`}>
        <h2 className="text-xs font-semibold uppercase tracking-widest">{label}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function IconPreview({ value }: { value?: string }) {
  if (!value?.trim()) return null;
  const isUrl = value.startsWith('http') || value.startsWith('/');
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        {isUrl ? (
          <Image src={value} alt="icon preview" width={24} height={24} className="h-6 w-6 object-contain" />
        ) : (
          <span className="text-lg leading-none">{value}</span>
        )}
      </div>
      <span className="text-[11px] text-gray-400">Preview</span>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowDown, ArrowUp, Edit3, PlusCircle, Trash2 } from 'lucide-react';
import { AdminOutletContext } from '../../app/layouts/AdminLayout';
import { Button } from '../../components/ui/Button';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { FormInput } from '../../components/ui/FormInput';
import { FormSelect } from '../../components/ui/FormSelect';
import { FormTextarea } from '../../components/ui/FormTextarea';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Toast } from '../../components/ui/Toast';
import { useContent } from '../../hooks/useContent';
import { Category } from '../../types/content';

export const CategoriesManagement: React.FC = () => {
  const { setHeaderMeta } = useOutletContext<AdminOutletContext>();
  const { store, createCategory, updateCategory, deleteCategory } = useContent();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [toast, setToast] = useState('');

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<Category['status']>('active');

  const openCreateModal = () => {
    setEditing(null);
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormStatus('active');
    setModalOpen(true);
  };

  useEffect(() => {
    setHeaderMeta({
      title: 'Categories Management',
      subtitle: 'Add, edit, toggle, and reorder game genres',
      action: (
        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusCircle size={15} />}
          onClick={openCreateModal}
        >
          Add Category
        </Button>
      ),
    });
  }, [setHeaderMeta]);

  const sortedCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...(store?.categories || [])]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
  }, [store?.categories, search]);

  if (!store) return null;

  const slugify = (v: string) =>
    v
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const openEditModal = (cat: Category) => {
    setEditing(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDesc(cat.description);
    setFormStatus(cat.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editing) {
      await updateCategory(editing.id, {
        name: formName.trim(),
        slug: slugify(formSlug || formName),
        description: formDesc.trim(),
        status: formStatus,
      });
      setToast(`Updated category "${formName.trim()}".`);
    } else {
      await createCategory({
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        slug: slugify(formSlug || formName),
        description: formDesc.trim(),
        displayOrder: store.categories.length + 1,
        status: formStatus,
      });
      setToast(`Created category "${formName.trim()}".`);
    }
    setModalOpen(false);
  };

  const moveOrder = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sortedCategories.length) return;
    const current = sortedCategories[index];
    const swap = sortedCategories[targetIdx];
    await updateCategory(current.id, { displayOrder: swap.displayOrder });
    await updateCategory(swap.id, { displayOrder: current.displayOrder });
    setToast('Category order updated.');
  };

  return (
    <div className="space-y-6">
      <div className="candy-glass-card rounded-[2rem] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search categories..."
          />
        </div>
        <p className="text-xs text-[#cbc3d6] tabular-nums">
          {sortedCategories.length} categories configured
        </p>
      </div>

      <div className="candy-glass-card rounded-[2rem] p-5 sm:p-6 divide-y divide-white/10">
        {sortedCategories.map((cat, idx) => {
          const gameCount = store.games.filter((g) => g.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="py-5 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-display text-lg font-semibold text-white">
                    {cat.name}
                  </h2>
                  <StatusBadge status={cat.status} />
                  <span className="text-xs text-[#948e9f] tabular-nums">
                    {gameCount} {gameCount === 1 ? 'game' : 'games'}
                  </span>
                </div>
                <p className="text-sm text-[#cbc3d6]">{cat.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={idx === 0}
                  onClick={() => moveOrder(idx, -1)}
                  className="p-2 rounded-full bg-[#151123] border border-[#BDA7FF]/20 text-[#cbc3d6] hover:text-white disabled:opacity-35 cursor-pointer"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={idx === sortedCategories.length - 1}
                  onClick={() => moveOrder(idx, 1)}
                  className="p-2 rounded-full bg-[#151123] border border-[#BDA7FF]/20 text-[#cbc3d6] hover:text-white disabled:opacity-35 cursor-pointer"
                >
                  <ArrowDown size={14} />
                </button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    const nextStatus =
                      cat.status === 'active' ? 'inactive' : 'active';
                    await updateCategory(cat.id, { status: nextStatus });
                    setToast(`${cat.name} set to ${nextStatus}.`);
                  }}
                >
                  {cat.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit3 size={14} />}
                  onClick={() => openEditModal(cat)}
                >
                  Edit
                </Button>
                <button
                  type="button"
                  aria-label={`Delete ${cat.name}`}
                  onClick={() => setDeleteTarget(cat)}
                  className="p-2 rounded-full bg-[#151123] border border-[#ffb4ab]/20 text-[#ffb4ab] hover:bg-[#93000a]/50 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormInput
            label="Category Name"
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              if (!editing) setFormSlug(slugify(e.target.value));
            }}
            required
          />
          <FormInput
            label="Slug"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            required
          />
          <FormTextarea
            label="Description"
            rows={3}
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />
          <FormSelect
            label="Status"
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as Category['status'])}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editing ? 'Save Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteCategory(deleteTarget.id);
          setToast(`Deleted category "${deleteTarget.name}".`);
        }}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Existing games in this category will remain and can be reassigned.`}
        confirmLabel="Delete"
      />

      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </div>
  );
};

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { uploadSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../utils/validators.js';
import { contentService } from '../../services/content.service.js';
import { SUBJECTS } from '../../services/mock/db.js';

export default function UploadContent() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: '', subject: '', description: '', startTime: '', endTime: '', rotationDuration: 10 },
  });

  const file = watch('file');

  const mutation = useMutation({
    mutationFn: (data) => contentService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Content uploaded for review');
      navigate('/teacher/my-content');
    },
    onError: (err) => toast.error(err.message || 'Upload failed'),
  });

  const handleFile = (f) => {
    if (!f) return;
    if (!ALLOWED_FILE_TYPES.includes(f.type)) { toast.error('Allowed: JPG, PNG, GIF'); return; }
    if (f.size > MAX_FILE_SIZE) { toast.error('Max file size 10MB'); return; }
    setValue('file', f, { shouldValidate: true });
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-1">Upload Content</h1>
      <p className="text-sm text-slate-500 mb-5">Submit content for principal approval.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" {...register('title')} placeholder="e.g. Algebra Basics" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Subject *</label>
            <select className="input" {...register('subject')}>
              <option value="">Select subject…</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea rows={3} className="input" {...register('description')} placeholder="Short description (optional)" />
        </div>

        <div>
          <label className="label">File * (JPG, PNG, GIF — max 10MB)</label>
          <Controller
            control={control}
            name="file"
            render={() => (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition ${dragOver ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-300 dark:border-slate-600'}`}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="max-h-48 mx-auto rounded" />
                ) : (
                  <div className="text-sm text-slate-500 py-6">Drag & drop a file here, or</div>
                )}
                <label className="btn-secondary mt-3 inline-flex cursor-pointer">
                  Choose file
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </label>
                {file && <div className="text-xs text-slate-500 mt-2">{file.name} · {(file.size / 1024).toFixed(0)} KB</div>}
              </div>
            )}
          />
          {errors.file && <p className="text-xs text-red-600 mt-1">{errors.file.message}</p>}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Start time *</label>
            <input className="input" type="datetime-local" {...register('startTime')} />
            {errors.startTime && <p className="text-xs text-red-600 mt-1">{errors.startTime.message}</p>}
          </div>
          <div>
            <label className="label">End time *</label>
            <input className="input" type="datetime-local" {...register('endTime')} />
            {errors.endTime && <p className="text-xs text-red-600 mt-1">{errors.endTime.message}</p>}
          </div>
          <div>
            <label className="label">Rotation (sec)</label>
            <input className="input" type="number" min="1" {...register('rotationDuration')} />
            {errors.rotationDuration && <p className="text-xs text-red-600 mt-1">{errors.rotationDuration.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn-primary" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Uploading…' : 'Submit for review'}
          </button>
        </div>
      </form>
    </div>
  );
}

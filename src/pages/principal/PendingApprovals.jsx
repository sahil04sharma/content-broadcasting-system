import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { contentService } from '../../services/content.service.js';
import { approvalService } from '../../services/approval.service.js';
import ContentCard from '../../components/ContentCard.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import { rejectSchema } from '../../utils/validators.js';

export default function PendingApprovals() {
  const qc = useQueryClient();
  const [rejecting, setRejecting] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['content', 'pending'],
    queryFn: () => contentService.list({ status: 'pending' }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['content'] });
    qc.invalidateQueries({ queryKey: ['stats'] });
  };

  const approve = useMutation({
    mutationFn: (id) => approvalService.approve(id),
    onSuccess: () => { toast.success('Approved'); invalidate(); },
    onError: (e) => toast.error(e.message || 'Failed'),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => approvalService.reject(id, reason),
    onSuccess: () => { toast.success('Rejected'); invalidate(); setRejecting(null); },
    onError: (e) => toast.error(e.message || 'Failed'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(rejectSchema) });

  const openReject = (item) => { reset({ reason: '' }); setRejecting(item); };
  const onReject = (values) => reject.mutate({ id: rejecting.id, reason: values.reason });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Pending Approvals</h1>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState icon="⚠️" title="Failed to load" description={error?.message} />
      ) : data.length === 0 ? (
        <EmptyState title="Nothing pending" description="All submissions have been reviewed." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              actions={
                <>
                  <button
                    className="btn-primary flex-1"
                    onClick={() => approve.mutate(item.id)}
                    disabled={approve.isPending}
                  >Approve</button>
                  <button className="btn-danger flex-1" onClick={() => openReject(item)}>Reject</button>
                </>
              }
            />
          ))}
        </div>
      )}

      <Modal
        open={!!rejecting}
        title={`Reject "${rejecting?.title || ''}"`}
        onClose={() => setRejecting(null)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setRejecting(null)}>Cancel</button>
            <button className="btn-danger" onClick={handleSubmit(onReject)} disabled={reject.isPending}>
              {reject.isPending ? 'Rejecting…' : 'Reject'}
            </button>
          </>
        }
      >
        <label className="label">Reason for rejection *</label>
        <textarea rows={4} className="input" {...register('reason')} placeholder="Explain why this content is being rejected" />
        {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason.message}</p>}
      </Modal>
    </div>
  );
}

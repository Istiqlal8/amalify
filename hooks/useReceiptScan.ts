import { useCallback, useState } from 'react';

import type { FinanceDraft } from '@/domain/personalFinance';
import { parseReceipt, receiptDraft } from '@/domain/receipt';
import { scanReceipt, type ReceiptSource } from '@/services/receiptScanner';

type ReceiptScan = { scan: (source: ReceiptSource) => Promise<void>; busy: boolean; error: string | null };

/** Reads a receipt image and hands `onDraft` an expense filled from what was read. */
export function useReceiptScan(today: string, onDraft: (draft: FinanceDraft) => void): ReceiptScan {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (source: ReceiptSource) => {
    setBusy(true);
    setError(null);
    try {
      const blocks = await scanReceipt(source);
      if (!blocks) return;
      if (blocks.length === 0) return setError('Tulisan di nota tidak terbaca. Coba gambar yang lebih dekat dan terang.');
      onDraft(receiptDraft(parseReceipt(blocks, today), today));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [today, onDraft]);

  return { scan, busy, error };
}

import { useState } from 'react';
import { Alert } from 'react-native';

import { GroupGate } from '@/components/group/GroupGate';
import { FieldEditor } from '@/components/report/FieldEditor';
import { ReportCard } from '@/components/report/ReportCard';
import { ReportForm } from '@/components/report/ReportForm';
import { ClayButton } from '@/components/ui/ClayButton';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { entriesFor, sortReports, type GroupReport, type ReportDraft, type ReportField } from '@/domain/groupReport';
import { useGroupData } from '@/hooks/useGroupData';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import type { Group } from '@/services/groupService';
import { addReport, listReports, removeReport, setReportFields, updateReport } from '@/services/reportService';

export default function ReportScreen() {
  return (
    <StackScreen title="Report pekanan">
      <GroupGate>{(group, refreshGroups) => <GroupReports group={group} onFormatSaved={refreshGroups} />}</GroupGate>
    </StackScreen>
  );
}

/** `mode` is 'new', 'format', a report id being edited, or null for the plain list. */
function GroupReports({ group, onFormatSaved }: { group: Group; onFormatSaved: () => Promise<void> }) {
  const { colors } = useTheme();
  const { today } = useLogs();
  const me = useMyUserId();
  const members = useMembersToday(group.id, today);
  const { data, error, run } = useGroupData(group.id, listReports, 'group_reports');
  const [mode, setMode] = useState<string | null>(null);
  const nameOf = (id: string | null) => members.find((m) => m.userId === id)?.name ?? null;
  const blank: ReportDraft = { day: today, time: '19:30', location: '', entries: entriesFor(group.report_fields) };

  function save(draft: ReportDraft) {
    const id = mode;
    setMode(null);
    run((db) => (id === 'new' ? addReport(db, group.id, draft) : updateReport(db, id!, draft)));
  }

  function saveFormat(fields: ReportField[]) {
    setMode(null);
    run((db) => setReportFields(db, group.id, fields)).then(onFormatSaved);
  }

  function confirmRemove(report: GroupReport) {
    Alert.alert('Hapus laporan ini?', undefined, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => run((db) => removeReport(db, report.id)) },
    ]);
  }

  if (mode === 'format') return <FieldEditor initial={group.report_fields} onSave={saveFormat} onCancel={() => setMode(null)} />;
  if (mode === 'new') return <ReportForm initial={blank} today={today} onSave={save} onCancel={() => setMode(null)} />;

  return (
    <>
      <ClayButton label="Buat laporan" onPress={() => setMode('new')} />
      {me === group.created_by && <ClayButton label="Atur format laporan" tone="soft" onPress={() => setMode('format')} />}
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      {data.length === 0 && <Txt variant="caption">Belum ada laporan.</Txt>}
      {sortReports(data).map((r) =>
        mode === r.id ? (
          <ReportForm
            key={r.id}
            initial={{ ...r, entries: entriesFor(group.report_fields, r.entries) }}
            today={today}
            onSave={save}
            onCancel={() => setMode(null)}
          />
        ) : (
          <ReportCard
            key={r.id}
            report={r}
            groupName={group.name}
            author={nameOf(r.createdBy)}
            mine={r.createdBy === me}
            onEdit={() => setMode(r.id)}
            onRemove={() => confirmRemove(r)}
          />
        ),
      )}
    </>
  );
}

import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GroupGate } from '@/components/group/GroupGate';
import { Avatar } from '@/components/ui/Avatar';
import { DateButton } from '@/components/ui/DateButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { finishedBy, recap } from '@/domain/groupProgress';
import type { TemplateField } from '@/domain/groupTemplate';
import { useGroupLogs } from '@/hooks/useGroupLogs';
import { useGroupTemplate } from '@/hooks/useGroupTemplate';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyRole } from '@/hooks/useMyRole';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import type { Group, MemberToday } from '@/services/groupService';

type View_ = 'anggota' | 'amalan';

export default function MonitorScreen() {
  return (
    <StackScreen title="Pantau anggota">
      <GroupGate>{(group) => <Monitor group={group} />}</GroupGate>
    </StackScreen>
  );
}

function Monitor({ group }: { group: Group }) {
  const { today } = useLogs();
  const me = useMyUserId();
  const members = useMembersToday(group.id, today);
  const { isAdmin } = useMyRole(members, me);
  const { template, loading } = useGroupTemplate(group.id);
  const [day, setDay] = useState(today);
  const [mode, setMode] = useState<View_>('anggota');
  const fields = template?.fields ?? [];
  const { logs, error } = useGroupLogs(isAdmin ? group.id : null, fields, day, me);
  const known = members.some((m) => m.userId === me);

  if (known && !isAdmin) return <Txt>Hanya admin grup yang bisa memantau anggota.</Txt>;
  if (loading || !known) return <Txt>Memuat…</Txt>;
  if (fields.length === 0) return <Txt>Belum ada daftar amalan grup.</Txt>;

  return (
    <>
      <View style={localStyles.bar}>
        <Txt variant="caption" style={localStyles.flex}>
          Progres amalan grup. Amalan mingguan dan bulanan dihitung untuk periode yang memuat tanggal ini.
        </Txt>
        <DateButton label="Tanggal" value={day} max={today} onChange={setDay} />
      </View>
      <PillTabs
        options={[
          { id: 'anggota', label: 'Per anggota' },
          { id: 'amalan', label: 'Per amalan' },
        ]}
        value={mode}
        onChange={(v) => setMode(v as View_)}
      />
      {mode === 'anggota' ? (
        <ByMember members={members} fields={fields} logs={logs} day={day} />
      ) : (
        <ByField members={members} fields={fields} logs={logs} day={day} />
      )}
      {error && <Txt>{error}</Txt>}
    </>
  );
}

type ListProps = { members: MemberToday[]; fields: TemplateField[]; logs: ReturnType<typeof useGroupLogs>['logs']; day: string };

function ByMember({ members, fields, logs, day }: ListProps) {
  const styles = useStyles(makeStyles);
  const [open, setOpen] = useState<string | null>(null);
  const rows = members
    .map((m) => ({ m, r: recap(logs, m.userId, fields, day) }))
    .sort((a, b) => b.r.percent - a.r.percent || a.m.name.localeCompare(b.m.name));

  return (
    <>
      {rows.map(({ m, r }) => {
        const expanded = open === m.userId;
        return (
          <View key={m.userId} style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={`${m.name}, ${r.done} dari ${r.total} selesai, ${r.percent} persen`}
              onPress={() => setOpen(expanded ? null : m.userId)}
              style={styles.head}>
              <Avatar name={m.name} url={m.avatarUrl} size={40} />
              <View style={styles.flex}>
                <Txt variant="bold" numberOfLines={1}>{m.name}</Txt>
                <Txt variant="caption">{r.done}/{r.total} selesai</Txt>
                <Bar percent={r.percent} />
              </View>
              <Txt variant="bold">{r.percent}%</Txt>
            </Pressable>
            {expanded &&
              fields.map((f) => {
                const count = r.counts[f.id] ?? 0;
                const done = count >= Math.max(1, f.target);
                return (
                  <View key={f.id} style={styles.item}>
                    <Txt style={styles.flex} numberOfLines={1}>
                      {done ? '✓ ' : '○ '}
                      {f.label}
                    </Txt>
                    <Txt variant="caption">
                      {f.kind === 'count' ? `${count}/${f.target} ${f.unit}` : done ? 'Selesai' : 'Belum'}
                    </Txt>
                  </View>
                );
              })}
          </View>
        );
      })}
    </>
  );
}

function ByField({ members, fields, logs, day }: ListProps) {
  const styles = useStyles(makeStyles);
  const ids = members.map((m) => m.userId);
  return (
    <>
      {fields.map((f) => {
        const n = finishedBy(logs, ids, f, day);
        const percent = ids.length === 0 ? 0 : Math.round((n / ids.length) * 100);
        return (
          <View key={f.id} style={styles.card} accessible accessibilityLabel={`${f.label}, ${n} dari ${ids.length} anggota selesai`}>
            <View style={styles.head}>
              <View style={styles.flex}>
                <Txt variant="bold" numberOfLines={1}>{f.label}</Txt>
                <Txt variant="caption">{n}/{ids.length} anggota selesai</Txt>
                <Bar percent={percent} />
              </View>
            </View>
          </View>
        );
      })}
    </>
  );
}

function Bar({ percent }: { percent: number }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, percent))}%` }]} />
    </View>
  );
}

const localStyles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    item: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingLeft: 52 },
    flex: { flex: 1, gap: 2 },
    track: { height: 6, borderRadius: radius.pill, backgroundColor: c.muted, overflow: 'hidden', marginTop: 2 },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.primary },
  });

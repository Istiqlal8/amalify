import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PlanItemRow } from '@/components/PlanItemRow';
import { CadencePlantCard } from '@/components/plan/CadencePlantCard';
import { TodayPlantCard } from '@/components/TodayPlantCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { CountTabs, type CountTab } from '@/components/ui/CountTabs';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { cadenceKey, cadenceLabel, cadenceOf, LONG_CADENCES, type Cadence } from '@/domain/cadence';
import { entryFor, recap } from '@/domain/groupProgress';
import { takenFields, toDraft, type TemplateField } from '@/domain/groupTemplate';
import { isPausedSection } from '@/domain/haid';
import type { PlanItem } from '@/domain/plan';
import { useGroupDaySummary } from '@/hooks/useGroupDaySummary';
import { useGroupLogs } from '@/hooks/useGroupLogs';
import { useGroupTemplate } from '@/hooks/useGroupTemplate';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyRole } from '@/hooks/useMyRole';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import type { Group } from '@/services/groupService';

type Props = { group: Group };

const asItem = (f: TemplateField): PlanItem => ({ ...toDraft(f), id: f.id });

/** Harian is always offered; a longer cadence appears only once the list has an amalan in it. */
function tabsFor(fields: TemplateField[]): CountTab<Cadence>[] {
  const count = (c: Cadence) => fields.filter((f) => cadenceOf(f) === c).length;
  return [
    { id: 'harian' as Cadence, label: 'Harian', count: count('harian') },
    ...LONG_CADENCES.filter((c) => count(c) > 0).map((c) => ({ id: c, label: cadenceLabel(c), count: count(c) })),
  ];
}

/**
 * The group's amal list on its own screen, laid out like the personal one: a plant that grows with
 * the picked cadence, tabs per cadence, and the checklist. Ticks go to the group so the admin can
 * follow along; only an admin changes the list, from the editor.
 */
export function TemplateCard({ group }: Props) {
  const styles = useStyles(makeStyles);
  const { today, todayHaid, plan, replacePlan } = useLogs();
  const me = useMyUserId();
  const members = useMembersToday(group.id, today);
  const { isAdmin } = useMyRole(members, me);
  const { template, loading } = useGroupTemplate(group.id);
  const fields = template?.fields ?? [];
  const { logs, loading: logsLoading, error, set } = useGroupLogs(group.id, fields, today, me);
  const author = members.find((m) => m.userId === template?.updatedBy);
  const [picked, setPicked] = useState<Cadence>('harian');
  // The group farm grows from today's harian list, whichever tab is open.
  const harian = fields.filter((f) => cadenceOf(f) === 'harian' && !(todayHaid && isPausedSection(f.section)));
  const harianPercent = me ? recap(logs, me, harian, today).percent : 0;
  useGroupDaySummary(!loading && !logsLoading && me !== null && harian.length > 0, group.id, today, harianPercent);

  if (loading) return <Txt>Memuat…</Txt>;
  if (fields.length === 0 && !isAdmin) return <Txt>Admin belum membuat amalan grup.</Txt>;

  const tabs = tabsFor(fields);
  const tab = tabs.some((t) => t.id === picked) ? picked : 'harian';
  const daily = tab === 'harian';
  // Haid pauses the day's sholat and Quran; a longer bucket spans clean days too, so it stands.
  const paused = (f: TemplateField) => daily && todayHaid && isPausedSection(f.section);
  const rows = fields.filter((f) => cadenceOf(f) === tab);
  const active = rows.filter((f) => !paused(f));
  const mine = me ? recap(logs, me, active, today) : null;
  const percent = mine?.percent ?? 0;
  const entry = me ? entryFor(logs, me, fields, today) : undefined;
  // Copies taken before the list went live would otherwise show the same amalan twice.
  const copies = takenFields(fields, plan.items);

  function dropCopies() {
    const ids = new Set(copies.map((f) => f.id));
    Alert.alert('Hapus salinan?', `${copies.length} amalan grup juga ada di amalan pribadi kamu. Hapus salinannya supaya tidak dobel?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => replacePlan({ items: plan.items.filter((it) => !ids.has(it.id)), at: Date.now() }) },
    ]);
  }

  return (
    <>
      {daily ? (
        <TodayPlantCard percent={percent} streakDays={0} loaded={!logsLoading} />
      ) : (
        <CadencePlantCard cadence={tab} bucket={cadenceKey(tab, today)} percent={percent} />
      )}
      {tabs.length > 1 && <CountTabs options={tabs} value={tab} onChange={setPicked} />}

      <View style={styles.card}>
        <Txt variant="heading" accessibilityRole="header" numberOfLines={1}>
          {group.name}
        </Txt>
        <Txt variant="caption">
          {author ? `Diatur oleh ${author.name}` : 'Diatur oleh admin'}
          {mine && mine.total > 0 ? ` · ${mine.done}/${mine.total} selesai` : ''}
        </Txt>

        {fields.length === 0 && <Txt variant="caption">Belum ada amalan grup. Buat daftar untuk anggota.</Txt>}
        {fields.length > 0 && rows.length === 0 && <Txt variant="caption">Belum ada amalan {cadenceLabel(tab).toLowerCase()}.</Txt>}

        {active.map((f) => (
          <PlanItemRow key={f.id} item={asItem(f)} entry={entry} onSet={(_, value) => set(f, value)} />
        ))}
        {active.length < rows.length && (
          <Txt variant="caption">{rows.length - active.length} amalan sholat & Quran libur selama haid.</Txt>
        )}

        {copies.length > 0 && (
          <ClayButton label={`Hapus ${copies.length} salinan dari amalan pribadi`} tone="soft" onPress={dropCopies} />
        )}
        {error && <Txt style={styles.error}>{error}</Txt>}
        {isAdmin && (
          <View style={styles.actions}>
            <View style={styles.flex}>
              <ClayButton
                label={fields.length === 0 ? 'Buat daftar' : 'Ubah daftar'}
                tone="soft"
                onPress={() => router.push({ pathname: '/template', params: { group: group.id } })}
              />
            </View>
            {fields.length > 0 && (
              <View style={styles.flex}>
                <ClayButton label="Pantau anggota" onPress={() => router.push({ pathname: '/pantau', params: { group: group.id } })} />
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    flex: { flex: 1 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingTop: space.xs },
    error: { color: c.destructive },
  });

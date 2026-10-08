import { useState } from 'react';
import { View } from 'react-native';

import { CoupleCard } from '@/components/couple/CoupleCard';
import { PartnerHaidView } from '@/components/couple/PartnerHaidView';
import { ClayButton } from '@/components/ui/ClayButton';
import { StackScreen } from '@/components/ui/StackScreen';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { dateKey } from '@/domain/dayLog';
import { isInviteCode } from '@/domain/couple';
import { useCouple } from '@/hooks/useCouple';
import { useAuth } from '@/providers/AuthProvider';
import { useLogs } from '@/providers/LogsProvider';
import { useProfile } from '@/providers/ProfileProvider';
import { supabase } from '@/services/supabase';

/**
 * Layar Pasangan: istri mengelola kode undangan dan melihat pratinjau yang
 * dibaca suami; suami memasukkan kode lalu membaca seluruh detail haid istri.
 */
export default function PasanganScreen() {
  const { user, groupsReady } = useAuth();
  const { isMale } = useProfile();
  const { haid } = useLogs();
  const today = dateKey(new Date());
  const { pair, role, linked, partnerHaid, partnerName, loading, error, join, leave, refresh } = useCouple(groupsReady);
  const [code, setCode] = useState('');

  if (!supabase) {
    return (
      <StackScreen title="Pasangan">
        <Txt>Pasangan belum dikonfigurasi.</Txt>
      </StackScreen>
    );
  }
  if (!user) {
    return (
      <StackScreen title="Pasangan">
        <Txt>Masuk di tab Akun dulu untuk menghubungkan pasangan.</Txt>
      </StackScreen>
    );
  }

  // Istri: kelola undangan + pratinjau persis yang dilihat suami.
  if (!isMale) {
    return (
      <StackScreen title="Pasangan">
        <CoupleCard />
        <Txt variant="heading">Yang dilihat suami</Txt>
        <PartnerHaidView log={haid} today={today} name="kamu" />
      </StackScreen>
    );
  }

  // Suami belum terhubung: masukkan kode seperti gabung grup.
  if (!pair || role !== 'husband' || !linked) {
    return (
      <StackScreen title="Pasangan">
        <Txt>Hubungkan ke istri dengan kode undangan 6 huruf darinya — sama seperti gabung grup.</Txt>
        <TextField
          label="Kode undangan istri"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          maxLength={6}
          autoCapitalize="characters"
          placeholder="AB12CD"
          autoFocus
        />
        <ClayButton label={loading ? 'Menghubungkan…' : 'Hubungkan'} disabled={loading || !isInviteCode(code)} onPress={() => join(code)} />
        {error && <Txt>{error}</Txt>}
      </StackScreen>
    );
  }

  return (
    <StackScreen title="Pasangan">
      {partnerHaid ? (
        <PartnerHaidView log={partnerHaid} today={today} name={partnerName} />
      ) : (
        <Txt>Menunggu data pertama dari istri… Minta istri membuka menu Haid sekali (data terkirim otomatis).</Txt>
      )}
      <View style={{ gap: 8 }}>
        <ClayButton label="Muat ulang" tone="soft" onPress={refresh} />
        <ClayButton label="Keluar dari pasangan" tone="soft" onPress={leave} />
      </View>
      {error && <Txt>{error}</Txt>}
    </StackScreen>
  );
}

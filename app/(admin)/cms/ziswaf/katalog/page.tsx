'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  DollarSign,
  Wallet,
  Wheat,
  Heart,
  Settings2,
  CreditCard,
  Building2,
  Image as ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const InputGroup = ({
  label,
  name,
  value,
  onChange,
  desc,
  type = 'text',
  prefix = 'Rp',
}: any) => (
  <div>
    <label className='block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5'>
      {label}
    </label>
    <div className='relative'>
      {prefix && (
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <span className='text-slate-400 font-bold text-sm'>{prefix}</span>
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className={`w-full ${prefix ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-semibold text-slate-800`}
      />
    </div>
    {desc && (
      <p className='text-[10px] text-slate-400 mt-1.5 font-medium leading-tight'>
        {desc}
      </p>
    )}
  </div>
);

export default function PengaturanZiswafPage() {
  const [activeTab, setActiveTab] = useState('HARGA');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');

  const [form, setForm] = useState<any>({});
  const [pembayaran, setPembayaran] = useState({
    rekening_ziswaf: '',
    qris_ziswaf_url: '',
  });

  // STATE WAKAF (Disimpan sebagai JSON Array)
  const [wakafList, setWakafList] = useState<any[]>([]);

  const formatRpString = (num: any) => {
    if (!num) return '';
    return parseInt(String(num).replace(/[^0-9]/g, ''), 10).toLocaleString(
      'id-ID',
    );
  };
  const parseNum = (val: string) =>
    parseFloat(String(val).replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: dataHarga } = await supabase
          .from('ziswaf')
          .select('*')
          .eq('id', 1)
          .single();
        if (dataHarga) {
          const formattedForm: any = {};
          Object.keys(dataHarga).forEach((key) => {
            if (key !== 'id' && key !== 'updated_at')
              formattedForm[key] = formatRpString(dataHarga[key]);
          });
          setForm(formattedForm);
          if (dataHarga.updated_at)
            setLastUpdate(
              new Date(dataHarga.updated_at).toLocaleString('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short',
              }),
            );
        }

        // Ambil Data dari tabel pengaturan_web (Rekening, QRIS, & JSON WAKAF)
        const { data: dataWeb } = await supabase
          .from('pengaturan_web')
          .select('*');
        if (dataWeb) {
          const rek =
            dataWeb.find((s) => s.kunci === 'rekening_ziswaf')?.nilai || '';
          const qris =
            dataWeb.find((s) => s.kunci === 'qris_ziswaf_url')?.nilai || '';
          setPembayaran({ rekening_ziswaf: rek, qris_ziswaf_url: qris });

          // Parsing data Wakaf dari string JSON
          const wakafString = dataWeb.find(
            (s) => s.kunci === 'wakaf_programs_data',
          )?.nilai;
          if (wakafString) {
            try {
              setWakafList(JSON.parse(wakafString));
            } catch (e) {
              console.error('Gagal parsing data wakaf', e);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChangeHarga = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev: any) => ({
      ...prev,
      [e.target.name]: formatRpString(e.target.value),
    }));
  };

  const handleUploadImage = async (
    file: File,
    type: 'QRIS' | 'WAKAF',
    wakafId?: number,
  ) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'mni-assets');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.url) {
        if (type === 'QRIS') {
          setPembayaran((prev) => ({ ...prev, qris_ziswaf_url: result.url }));
        } else if (type === 'WAKAF' && wakafId) {
          setWakafList((prev) =>
            prev.map((w) =>
              w.id === wakafId ? { ...w, gambar_url: result.url } : w,
            ),
          );
        }
      }
    } catch (err) {
      alert('Gagal upload gambar');
    } finally {
      setIsUploading(false);
    }
  };

  // FUNGSI WAKAF EDITOR LOKAL
  const updateWakafField = (id: number, field: string, value: string) => {
    setWakafList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    );
  };

  const addNewWakaf = () => {
    const newId = Date.now();
    setWakafList([
      ...wakafList,
      {
        id: newId,
        isNew: true,
        judul: 'Program Wakaf Baru',
        deskripsi: 'Tulis deskripsi...',
        target: 10000000,
        terkumpul: 0,
        gambar_url: '',
      },
    ]);
  };

  const deleteWakaf = (id: number) => {
    if (!confirm('Hapus program wakaf ini?')) return;
    setWakafList(wakafList.filter((w) => w.id !== id));
  };

  // FUNGSI SIMPAN TOTAL KE SUPABASE
  const handleSaveSemua = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Save Harga ke tabel ziswaf
      const dataHarga: any = { updated_at: new Date().toISOString() };
      Object.keys(form).forEach((k) => (dataHarga[k] = parseNum(form[k])));
      await supabase.from('ziswaf').update(dataHarga).eq('id', 1);

      // 2. Bersihkan tag isNew dari array wakaf sebelum disimpan
      const cleanWakafList = wakafList.map((w) => {
        const cleanW = { ...w };
        delete cleanW.isNew;
        // pastikan format angkanya benar
        cleanW.target = parseNum(String(cleanW.target));
        cleanW.terkumpul = parseNum(String(cleanW.terkumpul));
        return cleanW;
      });

      // 3. Save Rekening, QRIS, & JSON Wakaf ke tabel pengaturan_web
      await supabase.from('pengaturan_web').upsert(
        [
          { kunci: 'rekening_ziswaf', nilai: pembayaran.rekening_ziswaf },
          { kunci: 'qris_ziswaf_url', nilai: pembayaran.qris_ziswaf_url },
          {
            kunci: 'wakaf_programs_data',
            nilai: JSON.stringify(cleanWakafList),
          },
        ],
        { onConflict: 'kunci' },
      );

      // Hilangkan status isNew di UI
      setWakafList(cleanWakafList);

      alert('Semua pengaturan ZISWAF berhasil diperbarui!');
      setLastUpdate(
        new Date().toLocaleString('id-ID', {
          dateStyle: 'full',
          timeStyle: 'short',
        }),
      );
    } catch (error: any) {
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader2 className='w-10 h-10 text-teal-600 animate-spin' />
      </div>
    );

  return (
    <div className='p-4 md:p-8 w-full max-w-5xl mx-auto animate-in fade-in pb-24'>
      <div className='flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6'>
        <div>
          <h1 className='text-2xl md:text-xl font-semibold text-slate-700 tracking-tight'>
            Master Control ZISWAF
          </h1>
          <p className='text-sm text-slate-500 mt-1 font-medium'>
            Kelola Harga Pasar, Metode Pembayaran, dan Program Wakaf.
          </p>
        </div>
        {lastUpdate && (
          <div className='text-xs font-semibold text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm'>
            Terakhir diubah: {lastUpdate}
          </div>
        )}
      </div>

      <div className='flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 gap-2 overflow-x-auto mb-6'>
        {[
          { id: 'HARGA', label: 'Katalog Harga', icon: DollarSign },
          { id: 'PEMBAYARAN', label: 'Rekening & QRIS', icon: CreditCard },
          { id: 'WAKAF', label: 'Program Wakaf', icon: Building2 },
        ].map((tab) => (
          <button
            key={tab.id}
            type='button'
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-teal-50 text-teal-700 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}>
            <tab.icon className='w-4 h-4' /> {tab.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSaveSemua}
        className='space-y-6'>
        {activeTab === 'HARGA' && (
          <div className='space-y-6 animate-in fade-in'>
            {/* Zakat Fitrah & Fidyah */}
            <div className='bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm relative overflow-hidden'>
              <Heart className='absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 pointer-events-none' />
              <h2 className='text-lg font-bold text-teal-800 mb-6 flex items-center relative z-10'>
                <Settings2 className='w-5 h-5 mr-2' /> Zakat Fitrah & Fidyah
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10'>
                <InputGroup
                  value={form.harga_beras_fitrah}
                  onChange={handleChangeHarga}
                  label='Ketetapan Beras per Jiwa'
                  name='harga_beras_fitrah'
                  desc='Setara 2.5 Kg / 3.5 Liter.'
                />
                <InputGroup
                  value={form.harga_fidyah}
                  onChange={handleChangeHarga}
                  label='Ketetapan Fidyah per Hari'
                  name='harga_fidyah'
                  desc='Satu porsi makan mengenyangkan.'
                />
              </div>
            </div>

            {/* Nisab Zakat Mal */}
            <div className='bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm relative overflow-hidden'>
              <Wallet className='absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 pointer-events-none' />
              <h2 className='text-lg font-bold text-teal-800 mb-6 flex items-center relative z-10'>
                <DollarSign className='w-5 h-5 mr-2' /> Indikator Nisab (Zakat
                Mal)
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10'>
                <InputGroup
                  value={form.harga_emas}
                  onChange={handleChangeHarga}
                  label='Harga Emas per Gram'
                  name='harga_emas'
                  desc='Patokan Nisab (Setara 77,5 g).'
                />
                <InputGroup
                  value={form.harga_perak}
                  onChange={handleChangeHarga}
                  label='Harga Perak per Gram'
                  name='harga_perak'
                  desc='Alternatif Nisab (Setara 543,35 g).'
                />
              </div>
            </div>

            {/* Zakat Pertanian */}
            <div className='bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm relative overflow-hidden'>
              <Wheat className='absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 pointer-events-none' />
              <h2 className='text-lg font-bold text-teal-800 mb-6 flex items-center relative z-10'>
                <Wheat className='w-5 h-5 mr-2' /> Zakat Pertanian (Zuru')
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10'>
                <InputGroup
                  value={form.harga_beras_tani}
                  onChange={handleChangeHarga}
                  label='Beras Putih /Kg'
                  name='harga_beras_tani'
                  desc='Nisab = 815,758 Kg.'
                />
                <InputGroup
                  value={form.harga_gabah_tani}
                  onChange={handleChangeHarga}
                  label='Gabah Kering /Kg'
                  name='harga_gabah_tani'
                  desc='Nisab = 1.323,132 Kg.'
                />
              </div>
            </div>

            {/* Zakat An'am */}
            <div className='bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm'>
              <h2 className='text-lg font-bold text-teal-800 mb-6 flex items-center'>
                <DollarSign className='w-5 h-5 mr-2' /> Harga Konversi Zakat
                An'am
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-6'>
                  <h3 className='text-sm font-bold text-slate-700 border-b border-slate-100 pb-2'>
                    Kambing / Domba
                  </h3>
                  <InputGroup
                    value={form.harga_kambing}
                    onChange={handleChangeHarga}
                    label='Kambing (Umur 2 Thn) / Domba (1 Thn)'
                    name='harga_kambing'
                  />
                </div>
                <div className='space-y-6'>
                  <h3 className='text-sm font-bold text-slate-700 border-b border-slate-100 pb-2'>
                    Sapi / Kerbau
                  </h3>
                  <InputGroup
                    value={form.harga_sapi_tabi}
                    onChange={handleChangeHarga}
                    label="Sapi Tabi' (Umur 1 Tahun)"
                    name='harga_sapi_tabi'
                  />
                  <InputGroup
                    value={form.harga_sapi_musinnah}
                    onChange={handleChangeHarga}
                    label='Sapi Musinnah (Umur 2 Tahun)'
                    name='harga_sapi_musinnah'
                  />
                </div>
                <div className='space-y-6 md:col-span-2 pt-4'>
                  <h3 className='text-sm font-bold text-slate-700 border-b border-slate-100 pb-2'>
                    Unta
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    <InputGroup
                      value={form.harga_unta_bintu_makhad}
                      onChange={handleChangeHarga}
                      label='Bintu Makhad (1 Tahun)'
                      name='harga_unta_bintu_makhad'
                    />
                    <InputGroup
                      value={form.harga_unta_bintu_labun}
                      onChange={handleChangeHarga}
                      label='Bintu Labun (2 Tahun)'
                      name='harga_unta_bintu_labun'
                    />
                    <InputGroup
                      value={form.harga_unta_hiqqah}
                      onChange={handleChangeHarga}
                      label='Hiqqah (3 Tahun)'
                      name='harga_unta_hiqqah'
                    />
                    <InputGroup
                      value={form.harga_unta_jadzah}
                      onChange={handleChangeHarga}
                      label="Jadz'ah (4 Tahun)"
                      name='harga_unta_jadzah'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PEMBAYARAN' && (
          <div className='bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm animate-in fade-in'>
            <h2 className='text-lg font-bold text-teal-800 mb-6 flex items-center'>
              <CreditCard className='w-5 h-5 mr-2' /> Detail Pembayaran ZISWAF
            </h2>
            <div className='space-y-6'>
              <InputGroup
                prefix=''
                value={pembayaran.rekening_ziswaf}
                onChange={(e: any) =>
                  setPembayaran({
                    ...pembayaran,
                    rekening_ziswaf: e.target.value,
                  })
                }
                label='Instruksi & Nomor Rekening'
                name='rekening'
                desc='Contoh: Bank BSI 7123456789 a.n Masjid Nurul Iman'
              />

              <div>
                <label className='block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2'>
                  Gambar QRIS (Opsional)
                </label>
                <div className='flex items-center gap-6'>
                  <div className='w-40 h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group'>
                    {pembayaran.qris_ziswaf_url ? (
                      <img
                        src={pembayaran.qris_ziswaf_url}
                        className='w-full h-full object-contain'
                      />
                    ) : (
                      <ImageIcon className='w-8 h-8 text-slate-300' />
                    )}
                    <label className='absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity'>
                      <input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={(e) =>
                          handleUploadImage(e.target.files![0], 'QRIS')
                        }
                      />
                      <span className='text-white text-xs font-bold'>
                        Upload QRIS
                      </span>
                    </label>
                  </div>
                  <div className='text-sm text-slate-500'>
                    <p className='font-bold text-slate-700 mb-1'>
                      Tampilkan QRIS di Form
                    </p>
                    <p>
                      Jamaah dapat menscan barcode QRIS ini secara langsung dari
                      popup pembayaran. Kosongkan gambar jika hanya ingin
                      menggunakan transfer bank.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'WAKAF' && (
          <div className='space-y-6 animate-in fade-in'>
            <div className='flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm'>
              <p className='text-sm text-slate-500 font-medium'>
                Kelola kartu program wakaf yang tampil di publik.
              </p>
              <button
                type='button'
                onClick={addNewWakaf}
                className='bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2'>
                <Plus className='w-4 h-4' /> Tambah Program
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {wakafList.map((wakaf) => (
                <div
                  key={wakaf.id}
                  className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative group ${wakaf.isNew ? 'ring-2 ring-teal-500/50 bg-teal-50/20' : ''}`}>
                  <button
                    type='button'
                    onClick={() => deleteWakaf(wakaf.id)}
                    className='absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20'>
                    <Trash2 className='w-4 h-4' />
                  </button>
                  <div className='flex gap-4 mb-4'>
                    <div className='w-24 h-24 bg-slate-100 rounded-xl overflow-hidden relative group/img shrink-0 border border-slate-200'>
                      {wakaf.gambar_url ? (
                        <img
                          src={wakaf.gambar_url}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <ImageIcon className='w-6 h-6 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
                      )}
                      <label className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer transition-opacity'>
                        <input
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={(e) =>
                            handleUploadImage(
                              e.target.files![0],
                              'WAKAF',
                              wakaf.id,
                            )
                          }
                        />
                        <span className='text-white text-[9px] font-bold mt-1'>
                          Ubah Foto
                        </span>
                      </label>
                    </div>
                    <div className='flex-1 space-y-3 pr-8'>
                      <input
                        type='text'
                        value={wakaf.judul}
                        onChange={(e) =>
                          updateWakafField(wakaf.id, 'judul', e.target.value)
                        }
                        className='w-full font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-teal-500 outline-none pb-1 transition-colors'
                        placeholder='Judul Wakaf'
                      />
                      <textarea
                        value={wakaf.deskripsi}
                        onChange={(e) =>
                          updateWakafField(
                            wakaf.id,
                            'deskripsi',
                            e.target.value,
                          )
                        }
                        className='w-full text-xs text-slate-500 border-b border-transparent hover:border-slate-300 focus:border-teal-500 outline-none resize-none transition-colors'
                        rows={2}
                        placeholder='Deskripsi singkat...'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100'>
                    <div>
                      <label className='block text-[9px] font-bold text-slate-400 uppercase mb-1'>
                        Terkumpul (Rp)
                      </label>
                      <input
                        type='text'
                        value={formatRpString(wakaf.terkumpul)}
                        onChange={(e) =>
                          updateWakafField(
                            wakaf.id,
                            'terkumpul',
                            e.target.value.replace(/[^0-9]/g, ''),
                          )
                        }
                        className='w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-teal-700 outline-none focus:border-teal-500'
                      />
                    </div>
                    <div>
                      <label className='block text-[9px] font-bold text-slate-400 uppercase mb-1'>
                        Target (Rp)
                      </label>
                      <input
                        type='text'
                        value={formatRpString(wakaf.target)}
                        onChange={(e) =>
                          updateWakafField(
                            wakaf.id,
                            'target',
                            e.target.value.replace(/[^0-9]/g, ''),
                          )
                        }
                        className='w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500'
                      />
                    </div>
                  </div>

                  {/* Progress Bar Preview */}
                  <div className='mt-4'>
                    <div className='w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex'>
                      <div
                        className='bg-teal-500 h-full transition-all duration-500'
                        style={{
                          width: `${Math.min((parseNum(String(wakaf.terkumpul)) / parseNum(String(wakaf.target))) * 100, 100) || 0}%`,
                        }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
      {/* Floating Action Button */}
      <div className='fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center z-50'>
        <button
          onClick={handleSaveSemua}
          disabled={isSaving || isUploading}
          className='bg-teal-700 hover:bg-teal-800 text-white px-12 py-3.5 rounded-full font-bold flex items-center transition-all shadow-lg shadow-teal-900/20 disabled:opacity-50'>
          {isSaving || isUploading ? (
            <Loader2 className='w-5 h-5 mr-2 animate-spin' />
          ) : (
            <Save className='w-5 h-5 mr-2' />
          )}
          {isSaving ? 'Menyimpan...' : 'Simpan Semua Pembaruan'}
        </button>
      </div>
    </div>
  );
}

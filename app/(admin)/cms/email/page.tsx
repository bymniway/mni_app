'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Save,
  Loader2,
  LayoutPanelTop,
  HeartHandshake,
  Beef,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveEmailEditorZiswaf from '@/components/admin/LiveEmailEditorZiswaf';
import LiveEmailEditorKurban from '@/components/admin/LiveEmailEditorKurban';

export default function EditorEmailMaster() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State untuk memilih layanan mana yang sedang diedit
  const [activeService, setActiveService] = useState<'ZISWAF' | 'KURBAN'>(
    'ZISWAF',
  );

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('pengaturan_web').select('*');
      if (data) {
        const initialForm: any = {};
        data.forEach((item) => {
          initialForm[item.kunci] = item.nilai;
        });
        setForm(initialForm);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleTextChange = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  // Upload dinamis untuk ZISWAF dan KURBAN
  const handleImageUpload = async (
    type: 'LOGO' | 'STEMPEL' | 'LOGO_KURBAN' | 'STEMPEL_KURBAN',
    e: any,
  ) => {
    const file = e.target.files?.[0];
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
        // Tentukan key database berdasarkan type upload
        let key = '';
        if (type === 'LOGO') key = 'email_ziswaf_logo_url';
        else if (type === 'STEMPEL') key = 'email_ziswaf_stempel_url';
        else if (type === 'LOGO_KURBAN') key = 'email_kurban_logo_url';
        else if (type === 'STEMPEL_KURBAN') key = 'email_kurban_stempel_url';

        setForm((prev: any) => ({ ...prev, [key]: result.url }));
      }
    } catch (err) {
      alert('Gagal upload gambar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    const updates = Object.keys(form).map((key) => ({
      kunci: key,
      nilai: form[key],
    }));
    for (const item of updates) {
      await supabase
        .from('pengaturan_web')
        .upsert(item, { onConflict: 'kunci' });
    }
    setIsSaving(false);
    alert(`Konfigurasi Email ${activeService} berhasil dipublikasikan!`);
  };

  if (isLoading)
    return (
      <div className='p-20 flex justify-center'>
        <Loader2 className='animate-spin text-teal-600 w-10 h-10' />
      </div>
    );

  return (
    <div className='min-h-screen bg-slate-50 pb-20 px-4'>
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className='max-w-5xl mx-auto pt-8'>
        {/* HEADER ENGINE */}
        <div className=' sticky top-4 z-50 flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 gap-4'>
          <div className='flex items-center gap-4'>
            <div
              className={`p-3 text-white rounded-2xl ${activeService === 'ZISWAF' ? 'bg-teal-600' : 'bg-blue-800'}`}>
              <LayoutPanelTop className='w-6 h-6' />
            </div>
            <div>
              <h1 className='text-2xl font-black text-slate-800 tracking-tight'>
                Email Visual Engine
              </h1>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
                Branding & Communication Editor
              </p>
            </div>
          </div>
          <button
            onClick={handlePublish}
            disabled={isSaving || isUploading}
            className={`text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center shadow-lg disabled:opacity-50 ${activeService === 'ZISWAF' ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20' : 'bg-blue-800 hover:bg-blue-900 shadow-blue-800/20'}`}>
            {isSaving || isUploading ? (
              <Loader2 className='w-4 h-4 animate-spin mr-2' />
            ) : (
              <Save className='w-4 h-4 mr-2' />
            )}
            {isSaving ? 'Saving...' : 'Publish Templates'}
          </button>
        </div>

        {/* SWITCHER ZISWAF / KURBAN */}
        <div className='flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-8 max-w-sm mx-auto'>
          <button
            onClick={() => setActiveService('ZISWAF')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeService === 'ZISWAF' ? 'bg-teal-50 text-teal-700 shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}>
            <HeartHandshake className='w-5 h-5' /> ZISWAF
          </button>
          <button
            onClick={() => setActiveService('KURBAN')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeService === 'KURBAN' ? 'bg-blue-50 text-blue-800 shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Beef className='w-5 h-5' /> KURBAN
          </button>
        </div>

        {/* RENDER EDITOR BERDASARKAN SERVICE YANG AKTIF */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeService}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}>
            {activeService === 'ZISWAF' ? (
              <LiveEmailEditorZiswaf
                form={form}
                isEditor={true}
                onTextChange={handleTextChange}
                onImageUpload={handleImageUpload}
                isUploading={isUploading}
              />
            ) : (
              <LiveEmailEditorKurban
                form={form}
                isEditor={true}
                onTextChange={handleTextChange}
                onImageUpload={handleImageUpload}
                isUploading={isUploading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Save,
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Type,
  Undo,
  Redo,
  Eraser,
  Link2,
  Minus,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  CaseUpper,
  Code,
  Hash,
  Baseline,
  Tag,
  User,
  Columns,
  Rows,
  Trash,
  UploadCloud,
  Quote,
  Calendar,
  Subscript,
  Superscript,
  FileCode2,
  FileText, // <-- ICON BARU UNTUK BACKGROUND
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// KOMPONEN: MODERN SCROLLABLE RICH TEXT EDITOR
// ==========================================
const RichTextEditor = ({
  value,
  onChange,
  showSource,
}: {
  value: string;
  onChange: (val: string) => void;
  showSource: boolean;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inTableContext, setInTableContext] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [activeFormat, setActiveFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    fontName: '',
    formatBlock: '',
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const updateContent = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    checkFormatting();
  };

  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    updateContent();
  };

  const checkFormatting = () => {
    setActiveFormat({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      fontName: document.queryCommandValue('fontName'),
      formatBlock: document.queryCommandValue('formatBlock'),
    });

    const sel = window.getSelection();
    let inTable = false;
    if (sel && sel.rangeCount) {
      let node = sel.anchorNode;
      while (node && node.nodeName !== 'DIV') {
        if (node.nodeName === 'TD' || node.nodeName === 'TH') {
          inTable = true;
          break;
        }
        node = node.parentNode;
      }
    }
    setInTableContext(inTable);
  };

  const applyCustomStyle = (tag: string, styleString: string) => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && sel.toString().length > 0) {
      const text = sel.toString();
      const html = `<${tag} style="${styleString}">${text}</${tag}>`;
      execCmd('insertHTML', html);
    }
  };

  const applyBlockStyle = (styleName: string, styleValue: string) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node = sel.anchorNode;
    while (
      node &&
      !['P', 'DIV', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'TD', 'LI'].includes(
        node.nodeName,
      )
    ) {
      node = node.parentNode;
      if (node === editorRef.current) break;
    }
    if (node && node !== editorRef.current) {
      (node as HTMLElement).style[styleName as any] = styleValue;
      updateContent();
    }
  };

  const setFontSize = (pxSize: string) => {
    execCmd('fontSize', '7');
    if (editorRef.current) {
      const fonts = editorRef.current.querySelectorAll('font[size="7"]');
      fonts.forEach((font: any) => {
        font.removeAttribute('size');
        font.style.fontSize = `${pxSize}px`;
      });
      updateContent();
    }
  };

  const changeCase = (type: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.toString().length === 0) return;
    const text = sel.toString();
    let newText = '';
    if (type === 'UPPER') newText = text.toUpperCase();
    if (type === 'lower') newText = text.toLowerCase();
    if (type === 'Title')
      newText = text.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
      );
    execCmd('insertHTML', newText);
  };

  const handleArabic = () => {
    const sel = window.getSelection();
    const text = sel?.toString() || 'Tulis Arab di sini...';
    const html = `<div class="arabic" dir="rtl" style="font-size: 2rem; line-height: 2.2; text-align: right; background: #f8fafc; padding: 1rem; border-right: 4px solid #0f766e; border-radius: 0.5rem; margin: 1rem 0; color: #0f172a; font-family: 'Amiri', serif;">${text}</div><br/>`;
    execCmd('insertHTML', html);
  };

  const insertBasmalah = () => {
    const html = `<div class="arabic" dir="rtl" style="font-size: 2.5rem; text-align: center; margin: 2rem 0; font-weight: bold; color: #0f766e; font-family: 'Amiri', serif;">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div><br/>`;
    execCmd('insertHTML', html);
  };

  const insertCurrentDate = () => {
    const date = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    execCmd('insertHTML', `<strong>${date}</strong>`);
  };

  const applyList = (tag: 'ul' | 'ol', styleType: string) => {
    const cmd = tag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
    execCmd(cmd);
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      let node = sel.anchorNode;
      while (
        node &&
        node.nodeName !== 'UL' &&
        node.nodeName !== 'OL' &&
        node.nodeName !== 'DIV'
      ) {
        node = node.parentNode;
      }
      if (node && (node.nodeName === 'UL' || node.nodeName === 'OL')) {
        (node as HTMLElement).style.listStyleType = styleType;
        updateContent();
      }
    }, 50);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'mni-assets');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('API Error');
      const result = await res.json();

      if (result.url) {
        const imgHtml = `<img src="${result.url}" alt="Gambar Sisipan" style="border-radius: 1rem; max-width: 100%; height: auto; margin: 2rem auto; display: block; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);" /><br/>`;
        execCmd('insertHTML', imgHtml);
      }
    } catch (error) {
      alert('Gagal mengunggah gambar ke server MNI.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const insertTable = () => {
    const rows = prompt('Jumlah Baris:', '3') || '3';
    const cols = prompt('Jumlah Kolom:', '3') || '3';
    const r = parseInt(rows);
    const c = parseInt(cols);
    if (r > 0 && c > 0) {
      let html = `<table style="width:100%; border-collapse: collapse; margin: 2rem 0; font-size: 0.95em;">
        <thead><tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">`;
      for (let j = 0; j < c; j++)
        html += `<th style="padding: 12px; text-align: left; font-weight: bold; color: #334155; border: 1px solid #cbd5e1;">Header ${j + 1}</th>`;
      html += `</tr></thead><tbody>`;
      for (let i = 0; i < r; i++) {
        html += `<tr>`;
        for (let j = 0; j < c; j++)
          html += `<td style="padding: 12px; color: #475569; border: 1px solid #cbd5e1;">Data ${i + 1}.${j + 1}</td>`;
        html += `</tr>`;
      }
      html += `</tbody></table><br/>`;
      execCmd('insertHTML', html);
    }
  };

  const tableAction = (action: string) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node = sel.anchorNode;
    while (
      node &&
      node.nodeName !== 'TD' &&
      node.nodeName !== 'TH' &&
      node.nodeName !== 'DIV'
    ) {
      node = node.parentNode;
    }
    if (!node || (node.nodeName !== 'TD' && node.nodeName !== 'TH')) return;

    const cell = node as HTMLTableCellElement;
    const tr = cell.parentNode as HTMLTableRowElement;
    const tbody = tr.parentNode as HTMLTableSectionElement;
    const table = tbody.parentNode as HTMLTableElement;
    const cellIndex = Array.from(tr.children).indexOf(cell);

    if (action === 'insertRowBelow') {
      const newTr = document.createElement('tr');
      for (let i = 0; i < tr.children.length; i++)
        newTr.innerHTML += `<td style="border: 1px solid #cbd5e1; padding: 12px;">...</td>`;
      tr.after(newTr);
    } else if (action === 'insertRowAbove') {
      const newTr = document.createElement('tr');
      for (let i = 0; i < tr.children.length; i++)
        newTr.innerHTML += `<td style="border: 1px solid #cbd5e1; padding: 12px;">...</td>`;
      tr.before(newTr);
    } else if (action === 'insertColRight') {
      Array.from(tbody.children).forEach((row) => {
        const newTd = document.createElement('td');
        newTd.style.cssText = 'border: 1px solid #cbd5e1; padding: 12px;';
        newTd.innerHTML = '...';
        row.children[cellIndex].after(newTd);
      });
    } else if (action === 'insertColLeft') {
      Array.from(tbody.children).forEach((row) => {
        const newTd = document.createElement('td');
        newTd.style.cssText = 'border: 1px solid #cbd5e1; padding: 12px;';
        newTd.innerHTML = '...';
        row.children[cellIndex].before(newTd);
      });
    } else if (action === 'deleteRow') {
      tr.remove();
      setInTableContext(false);
    } else if (action === 'deleteCol') {
      Array.from(tbody.children).forEach((row) => {
        if (row.children[cellIndex]) row.children[cellIndex].remove();
      });
      setInTableContext(false);
    } else if (action === 'deleteTable') {
      table.remove();
      setInTableContext(false);
    }
    updateContent();
  };

  const ToolButton = ({ icon: Icon, onClick, title, active = false }: any) => (
    <button
      type='button'
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 ${active ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
      <Icon className='w-4 h-4' />
    </button>
  );

  return (
    <div className='relative w-full flex flex-col items-center'>
      {/* SCROLLABLE TOOLBAR MOBILE-FRIENDLY */}
      <div className='sticky top-6 z-50 w-full max-w-5xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-2.5 mb-8 transition-all duration-300'>
        <div className='flex overflow-x-auto hide-scrollbar gap-1.5 md:gap-2 pb-1 items-center w-full'>
          <div className='flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 shrink-0'>
            <ToolButton
              icon={Undo}
              title='Undo'
              onClick={() => execCmd('undo')}
            />
            <ToolButton
              icon={Redo}
              title='Redo'
              onClick={() => execCmd('redo')}
            />
          </div>

          <div className='w-px h-6 bg-slate-200 mx-1 shrink-0'></div>

          <select
            value={activeFormat.fontName || 'Arial'}
            onChange={(e) => execCmd('fontName', e.target.value)}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-2 outline-none cursor-pointer hover:bg-slate-100 shrink-0 min-w-[110px]'>
            <option value='Arial'>Arial</option>
            <option value='Helvetica'>Helvetica</option>
            <option value='Times New Roman'>Times New Roman</option>
            <option value='Verdana'>Verdana</option>
            <option value='Georgia'>Georgia</option>
            <option value='Courier New'>Courier New</option>
            <option value='Comic Sans MS'>Comic Sans</option>
            <option value='Trebuchet MS'>Trebuchet</option>
            <option value='Arial Black'>Arial Black</option>
            <option value='Impact'>Impact</option>
            <option value='Tahoma'>Tahoma</option>
            <option value='Geneva'>Geneva</option>
            <option value='Century Gothic'>Century</option>
            <option value='Lucida Grande'>Lucida</option>
            <option value='Optima'>Optima</option>
            <option value='Brush Script MT'>Brush Script</option>
            <option value='Consolas'>Consolas</option>
            <option value='Didot'>Didot</option>
            <option value='Franklin Gothic Medium'>Franklin</option>
            <option value='Hoefler Text'>Hoefler Text</option>
            <option value='Lucida Sans'>Lucida Sans</option>
            <option value='Monaco'>Monaco</option>
            <option value='Copperplate'>Copperplate</option>
            <option value='Papyrus'>Papyrus</option>
            <option value='Segoe UI'>Segoe UI</option>
            <option value='Baskerville'>Baskerville</option>
            <option value='Cambria'>Cambria</option>
            <option value='Garamond'>Garamond</option>
            <option value='Bookman'>Bookman</option>
            <option value='Times'>Times</option>
          </select>

          <select
            onChange={(e) => setFontSize(e.target.value)}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-2 outline-none cursor-pointer hover:bg-slate-100 shrink-0'>
            <option value=''>Ukuran</option>
            <option value='10'>10</option>
            <option value='11'>11</option>
            <option value='12'>12</option>
            <option value='14'>14</option>
            <option value='16'>16</option>
            <option value='18'>18</option>
            <option value='20'>20</option>
            <option value='24'>24</option>
            <option value='28'>28</option>
            <option value='36'>36</option>
          </select>

          <select
            value={activeFormat.formatBlock || 'P'}
            onChange={(e) => execCmd('formatBlock', e.target.value)}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-2 outline-none cursor-pointer hover:bg-slate-100 shrink-0 min-w-[100px]'>
            <option value='P'>Normal</option>
            <option value='H1'>Heading 1</option>
            <option value='H2'>Heading 2</option>
            <option value='H3'>Heading 3</option>
            <option value='H4'>Heading 4</option>
            <option value='BLOCKQUOTE'>Kutipan</option>
          </select>

          <div className='flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 shrink-0'>
            <ToolButton
              icon={Bold}
              title='Tebal'
              active={activeFormat.bold}
              onClick={() => execCmd('bold')}
            />
            <ToolButton
              icon={Italic}
              title='Miring'
              active={activeFormat.italic}
              onClick={() => execCmd('italic')}
            />
          </div>

          <select
            onChange={(e) => {
              if (e.target.value === 'single') execCmd('underline');
              else if (e.target.value)
                applyCustomStyle(
                  'span',
                  `text-decoration: underline ${e.target.value};`,
                );
              e.target.value = '';
            }}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-1 outline-none cursor-pointer hover:bg-slate-100 shrink-0 w-8'
            title='Underline'>
            <option value=''>U</option>
            <option value='single'>Single</option>
            <option value='double'>Double</option>
            <option value='dotted'>Dotted</option>
            <option value='wavy'>Wavy</option>
          </select>

          <select
            onChange={(e) => {
              if (e.target.value === 'single') execCmd('strikeThrough');
              else if (e.target.value)
                applyCustomStyle(
                  'span',
                  `text-decoration: line-through ${e.target.value};`,
                );
              e.target.value = '';
            }}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-1 outline-none cursor-pointer hover:bg-slate-100 shrink-0 w-8'
            title='Strikethrough'>
            <option value=''>S</option>
            <option value='single'>Coret 1</option>
            <option value='double'>Coret 2</option>
          </select>

          <div className='flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 shrink-0'>
            <ToolButton
              icon={Subscript}
              title='Subscript'
              onClick={() => execCmd('subscript')}
            />
            <ToolButton
              icon={Superscript}
              title='Superscript'
              onClick={() => execCmd('superscript')}
            />
          </div>

          <select
            onChange={(e) => {
              if (e.target.value) changeCase(e.target.value);
              e.target.value = '';
            }}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-2 outline-none cursor-pointer hover:bg-slate-100 shrink-0'>
            <option value=''>Aa Case</option>
            <option value='UPPER'>UPPERCASE</option>
            <option value='lower'>lowercase</option>
            <option value='Title'>Title Case</option>
          </select>

          <div className='flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 h-9 shrink-0'>
            <Baseline className='w-3.5 h-3.5 text-slate-400' />
            <input
              type='color'
              title='Warna Teks'
              onChange={(e) => execCmd('foreColor', e.target.value)}
              className='w-4 h-4 cursor-pointer border-none bg-transparent p-0'
            />
            <div className='w-px h-4 bg-slate-300 mx-1'></div>
            <div className='bg-yellow-400 w-3 h-3 rounded-sm border border-yellow-500'></div>
            <input
              type='color'
              title='Warna Latar'
              onChange={(e) => execCmd('hiliteColor', e.target.value)}
              className='w-4 h-4 cursor-pointer border-none bg-transparent p-0'
            />
          </div>

          <div className='w-px h-6 bg-slate-200 mx-1 shrink-0'></div>

          <div className='flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 shrink-0'>
            <ToolButton
              icon={AlignLeft}
              title='Kiri'
              active={activeFormat.justifyLeft}
              onClick={() => execCmd('justifyLeft')}
            />
            <ToolButton
              icon={AlignCenter}
              title='Tengah'
              active={activeFormat.justifyCenter}
              onClick={() => execCmd('justifyCenter')}
            />
            <ToolButton
              icon={AlignRight}
              title='Kanan'
              active={activeFormat.justifyRight}
              onClick={() => execCmd('justifyRight')}
            />
            <ToolButton
              icon={AlignJustify}
              title='Justify'
              active={activeFormat.justifyFull}
              onClick={() => execCmd('justifyFull')}
            />
          </div>

          <select
            onChange={(e) => {
              if (e.target.value) applyBlockStyle('lineHeight', e.target.value);
              e.target.value = '';
            }}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-2 outline-none cursor-pointer hover:bg-slate-100 shrink-0'>
            <option value=''>↕ Spasi Baris</option>
            <option value='1'>1.0 Rapat</option>
            <option value='1.15'>1.15 Sedang</option>
            <option value='1.5'>1.5 Luas</option>
            <option value='2'>2.0 Sangat Luas</option>
          </select>

          <select
            onChange={(e) => {
              if (e.target.value)
                applyBlockStyle('marginBottom', e.target.value);
              e.target.value = '';
            }}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-2 outline-none cursor-pointer hover:bg-slate-100 shrink-0'>
            <option value=''>⇊ Jarak Paragraf</option>
            <option value='0px'>0pt (Rapat)</option>
            <option value='8px'>8pt (Kecil)</option>
            <option value='16px'>16pt (Sedang)</option>
            <option value='24px'>24pt (Lebar)</option>
          </select>

          <select
            onChange={(e) => {
              if (e.target.value) applyList('ul', e.target.value);
              e.target.value = '';
            }}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-1 outline-none cursor-pointer hover:bg-slate-100 shrink-0 w-8'
            title='Bullets'>
            <option value=''>●</option>
            <option value='disc'>Disc</option>
            <option value='circle'>Circle</option>
            <option value='square'>Square</option>
          </select>

          <select
            onChange={(e) => {
              if (e.target.value) applyList('ol', e.target.value);
              e.target.value = '';
            }}
            className='h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-1 outline-none cursor-pointer hover:bg-slate-100 shrink-0 w-8'
            title='Numbers'>
            <option value=''>1.</option>
            <option value='decimal'>1, 2</option>
            <option value='lower-alpha'>a, b</option>
            <option value='upper-alpha'>A, B</option>
            <option value='lower-roman'>i, ii</option>
            <option value='upper-roman'>I, II</option>
          </select>

          <div className='flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 shrink-0'>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                execCmd('outdent');
              }}
              className='p-1.5 text-slate-500 text-[10px] font-bold hover:bg-slate-100 rounded'>
              &lt; Kiri
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                execCmd('indent');
              }}
              className='p-1.5 text-slate-500 text-[10px] font-bold hover:bg-slate-100 rounded'>
              Kanan &gt;
            </button>
          </div>

          <div className='w-px h-6 bg-slate-200 mx-1 shrink-0'></div>

          <div className='flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 items-center shrink-0'>
            <ToolButton
              icon={Link2}
              title='Link'
              onClick={() => execCmd('createLink', prompt('URL:') || '')}
            />
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              title='Upload Gambar (API MNI)'
              className='p-2 text-slate-500 hover:text-slate-800 transition-all rounded-lg hover:bg-slate-100'>
              {isUploading ? (
                <Loader2 className='w-4 h-4 animate-spin text-teal-600' />
              ) : (
                <ImageIcon className='w-4 h-4' />
              )}
            </button>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept='image/*'
              className='hidden'
            />
            <ToolButton
              icon={TableIcon}
              title='Tabel'
              onClick={insertTable}
            />
            <ToolButton
              icon={Quote}
              title='Kutipan'
              onClick={() => execCmd('formatBlock', 'BLOCKQUOTE')}
            />
            <ToolButton
              icon={FileCode2}
              title='Block Kode'
              onClick={() =>
                applyCustomStyle(
                  'pre',
                  'background:#1e293b; color:#38bdf8; padding:1rem; border-radius:0.5rem; font-family:monospace; display:block; overflow-x:auto;',
                )
              }
            />
            <ToolButton
              icon={Calendar}
              title='Insert Tanggal'
              onClick={insertCurrentDate}
            />
            <ToolButton
              icon={Minus}
              title='Garis Pemisah'
              onClick={() => execCmd('insertHorizontalRule')}
            />
          </div>

          <div className='flex gap-1 shrink-0 px-2'>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleArabic();
              }}
              className='flex items-center gap-1.5 px-3 py-1.5 h-9 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors border border-teal-200'>
              <Type className='w-3.5 h-3.5' /> ARAB
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                insertBasmalah();
              }}
              className='px-3 py-1.5 h-9 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-[10px] font-bold transition-colors shadow-sm'>
              BISMILLAH
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                execCmd('removeFormat');
              }}
              className='p-2 h-9 bg-rose-50 text-red-600 hover:bg-red-100 rounded-lg border border-rose-200 shadow-sm transition-colors'
              title='Hapus Semua Format'>
              <Eraser className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE TOOLS CONTEXT MENU */}
      <AnimatePresence>
        {inTableContext && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='w-full max-w-4xl bg-teal-50 border border-teal-200 p-2 mb-4 rounded-xl flex flex-wrap gap-2 items-center overflow-hidden z-30'>
            <span className='text-[10px] font-black text-teal-800 tracking-wider mr-2'>
              PENGATURAN TABEL:
            </span>
            <div className='flex bg-white border border-teal-200 rounded-lg p-0.5 shadow-sm'>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  tableAction('insertRowAbove');
                }}
                className='px-2 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-100 flex items-center gap-1'>
                <Rows className='w-3 h-3' /> +Baris Atas
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  tableAction('insertRowBelow');
                }}
                className='px-2 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-100 flex items-center gap-1'>
                <Rows className='w-3 h-3' /> +Baris Bawah
              </button>
            </div>
            <div className='flex bg-white border border-teal-200 rounded-lg p-0.5 shadow-sm'>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  tableAction('insertColLeft');
                }}
                className='px-2 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-100 flex items-center gap-1'>
                <Columns className='w-3 h-3' /> +Kolom Kiri
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  tableAction('insertColRight');
                }}
                className='px-2 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-100 flex items-center gap-1'>
                <Columns className='w-3 h-3' /> +Kolom Kanan
              </button>
            </div>
            <div className='flex bg-white border border-red-200 rounded-lg p-0.5 shadow-sm ml-auto'>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  tableAction('deleteRow');
                }}
                className='px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50'>
                Hapus Baris
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  tableAction('deleteCol');
                }}
                className='px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50'>
                Hapus Kolom
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  tableAction('deleteTable');
                }}
                className='px-2 py-1 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded flex items-center gap-1'>
                <Trash className='w-3 h-3' /> Hapus Tabel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANVAS EDITOR */}
      <div className='w-full max-w-4xl bg-white rounded-none md:rounded-3xl md:shadow-[0_20px_50px_rgb(0,0,0,0.05)] border-0 md:border border-slate-200 overflow-hidden relative mb-20'>
        {showSource ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className='w-full min-h-[70vh] p-10 bg-slate-900 text-teal-400 font-mono text-sm outline-none resize-none leading-relaxed'
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            onKeyUp={checkFormatting}
            onMouseUp={checkFormatting}
            className='w-full min-h-[70vh] p-6 md:p-16 outline-none prose-dakwah transition-all focus:outline-teal-500/10'
            style={{
              fontSize: '1.125rem',
              color: '#334155',
              lineHeight: '1.8',
            }}></div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// DASHBOARD ADMIN CMS MEDIA
// ==========================================
export default function AdminMediaCMS() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSource, setShowSource] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // STATE BARU: MULTI-SELECT KONTEN MEDIA
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isSelectionMode = selectedIds.length > 0;

  const [formData, setForm] = useState({
    id: null,
    judul: '',
    slug: '',
    kategori: '',
    tipe: 'Artikel',
    penulis: 'Tim Redaksi MNI',
    cover_url: '',
    konten: '',
    is_published: true,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('artikel')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setArticles(data);
    setIsLoading(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm({ ...formData, judul: val, slug: generateSlug(val) });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('bucket', 'mni-assets');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      if (!res.ok) throw new Error('API Upload Error');

      const result = await res.json();
      if (result.url) {
        setForm({ ...formData, cover_url: result.url });
      }
    } catch (error) {
      alert('Gagal mengunggah foto sampul ke server MNI.');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from('artikel').upsert({
      ...formData,
      id: formData.id || undefined,
      updated_at: new Date().toISOString(),
    });
    if (!error) {
      setIsModalOpen(false);
      fetchArticles();
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setForm({
      id: null,
      judul: '',
      slug: '',
      kategori: '',
      tipe: 'Artikel',
      penulis: 'Tim Redaksi MNI',
      cover_url: '',
      konten: '',
      is_published: true,
    });
  };

  // FUNGSI BARU: MULTI-SELECT & BULK DELETE
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(`Hapus ${selectedIds.length} konten terpilih secara permanen?`)
    )
      return;
    setIsLoading(true);
    const { error } = await supabase
      .from('artikel')
      .delete()
      .in('id', selectedIds);
    if (!error) {
      setSelectedIds([]);
      fetchArticles();
    } else {
      alert('Gagal menghapus data massal.');
      setIsLoading(false);
    }
  };

  const wordCount = formData.konten
    .replace(/<[^>]*>/g, '')
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className='p-4 md:p-8 bg-[#f8fafc] min-h-screen pb-24 relative'>
      {/* ==========================================
          INJECT ANIMASI JIGGLE ELEGANT & TYPOGRAPHY
          ========================================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .prose-dakwah p { margin-bottom: 1.5em; }
        .prose-dakwah h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5em; color: #0f172a; }
        .prose-dakwah h2 { font-size: 1.875rem; font-weight: 800; color: #0f172a; margin-top: 1.5em; margin-bottom: 0.75em; letter-spacing: -0.025em; }
        .prose-dakwah h3 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 1.5em; margin-bottom: 0.75em; }
        .prose-dakwah blockquote { border-left: 4px solid #14b8a6; padding-left: 1.5rem; font-style: italic; color: #475569; margin: 2em 0; font-size: 1.25rem; line-height: 1.6; background: #f0fdfa; padding: 1.5rem; border-radius: 0.5rem; }
        .prose-dakwah ul { list-style-position: inside; margin-bottom: 1.5em; color: #475569; }
        .prose-dakwah ol { list-style-position: inside; margin-bottom: 1.5em; color: #475569; }
        .prose-dakwah a { color: #0ea5e9; text-decoration: underline; text-underline-offset: 4px; }
        .prose-dakwah [dir="rtl"], .prose-dakwah .arabic { font-family: 'Amiri', serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes subtle-jiggle {
          0% { transform: rotate(-0.5deg) scale(0.99); }
          50% { transform: rotate(0.5deg) scale(0.99); }
          100% { transform: rotate(-0.5deg) scale(0.99); }
        }
        .animate-subtle-jiggle {
          animation: subtle-jiggle 0.4s ease-in-out infinite;
          transform-origin: center center;
          cursor: pointer !important;
        }
        .animate-subtle-jiggle:nth-child(even) {
          animation-direction: reverse;
          animation-duration: 0.45s;
        }
      `,
        }}
      />

      {/* ==========================================
          FLOATING ACTION BAR (PILL) ALA MACOS
          ========================================== */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className='fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 text-white px-3 py-3 rounded-full shadow-2xl flex items-center gap-3 w-max'>
            <div className='flex items-center gap-3 pl-2 pr-4 border-r border-zinc-700'>
              <span className='flex h-3 w-3 relative'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-teal-500'></span>
              </span>
              <span className='text-sm font-bold tracking-wide'>
                {selectedIds.length}{' '}
                <span className='text-zinc-400 font-medium hidden sm:inline'>
                  Terpilih
                </span>
              </span>
            </div>

            <button
              onClick={() => setSelectedIds(articles.map((a) => a.id))}
              className='text-xs font-bold text-zinc-400 hover:text-white transition-colors px-2'>
              Pilih Semua
            </button>

            <button
              onClick={handleBulkDelete}
              className='flex items-center text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2 shadow-inner'>
              <Trash2 className='w-3.5 h-3.5 mr-1.5' /> Hapus
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className='ml-2 p-2 bg-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-700 hover:text-white transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-extrabold text-slate-800 tracking-tight'>
            Media Center
          </h1>
          <p className='text-slate-500 text-sm font-medium mt-1'>
            CMS Dakwah & Literasi Digital MNI
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className='bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full font-bold flex items-center shadow-xl shadow-slate-900/20 transition-all active:scale-95'>
          <Plus className='w-5 h-5 mr-2' /> Tulis Konten Baru
        </button>
      </div>

      <div className='bg-white p-3 rounded-2xl shadow-sm mb-6 flex items-center border border-slate-100'>
        <Search className='w-5 h-5 ml-3 text-slate-400 shrink-0' />
        <input
          type='text'
          placeholder='Cari judul artikel...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 bg-transparent outline-none text-slate-700 font-medium'
        />
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isSelectionMode ? 'select-none' : ''}`}>
        {isLoading ? (
          <div className='col-span-full py-20 flex justify-center'>
            <Loader2 className='w-10 h-10 animate-spin text-teal-600' />
          </div>
        ) : (
          articles
            .filter((a) =>
              a.judul.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => isSelectionMode && toggleSelect(item.id)}
                  className={`bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col group transition-all duration-300 relative
                    ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:shadow-xl'}
                    ${isSelected ? 'border-teal-500 ring-2 ring-teal-500/30 scale-[0.98]' : 'border border-slate-100'}
                  `}>
                  <div className='aspect-video relative bg-slate-100 overflow-hidden shrink-0'>
                    {/* ==========================================
                        DOT INDIKATOR ELEGANT
                        ========================================== */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(item.id);
                      }}
                      className={`absolute top-3 left-3 z-[50] w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center
                        ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]'
                            : 'border-white/90 bg-black/30 backdrop-blur-md hover:border-white'
                        }
                      `}>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 20,
                          }}
                          className='w-2.5 h-2.5 rounded-full bg-white'
                        />
                      )}
                    </button>

                    {item.cover_url ? (
                      <img
                        src={item.cover_url}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <ImageIcon className='w-12 h-12 text-slate-200' />
                      </div>
                    )}

                    {/* Badge Tipe di kiri bawah agar tak numpuk dgn dot */}
                    <div className='absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-slate-700 uppercase tracking-wider shadow-sm'>
                      {item.tipe}
                    </div>

                    {!item.is_published && (
                      <div className='absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm'>
                        DRAFT
                      </div>
                    )}
                  </div>

                  <div className='p-5 flex flex-col flex-1 relative overflow-hidden'>
                    {/* IKON BACKGROUND MENGEMBANG DI KANAN BAWAH */}
                    <div className='absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700 z-0'>
                      <FileText className='w-40 h-40' />
                    </div>

                    <div className='relative z-10 flex flex-col flex-1'>
                      <span className='text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2'>
                        {item.kategori || 'Tanpa Kategori'}
                      </span>
                      <h3 className='font-bold text-slate-800 text-lg leading-snug mb-4 line-clamp-2'>
                        {item.judul}
                      </h3>

                      <div className='mt-auto pt-4 border-t border-slate-50 flex items-center justify-between'>
                        <span className='text-xs font-semibold text-slate-400'>
                          {item.views} Views
                        </span>

                        <div className='flex gap-2'>
                          {/* Sembunyikan tombol saat Mode Seleksi */}
                          {!isSelectionMode && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm(item);
                                  setIsModalOpen(true);
                                }}
                                className='p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors'>
                                <Edit3 className='w-4 h-4' />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (
                                    confirm('Hapus konten ini secara permanen?')
                                  ) {
                                    await supabase
                                      .from('artikel')
                                      .delete()
                                      .eq('id', item.id);
                                    fetchArticles();
                                  }
                                }}
                                className='p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors'>
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* FULLSCREEN WRITING CANVAS (Tetap Utuh Tidak Dirubah) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[100] bg-slate-50/95 backdrop-blur-md flex flex-col overflow-y-auto'>
            {/* Header Canvas Murni (Sticky Top 0) */}
            <div className='sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500'>
                  <X className='w-6 h-6' />
                </button>
                <div className='text-[10px] font-bold uppercase tracking-widest text-slate-400 hidden md:block'>
                  {wordCount} KATA
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setShowSource(!showSource)}
                  className='text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors md:block'>
                  {showSource ? 'Matikan Kode' : '<> Kode HTML'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className='bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold flex items-center hover:bg-teal-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm'>
                  {isSaving ? (
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  ) : (
                    <Save className='w-4 h-4 mr-2' />
                  )}{' '}
                  {formData.is_published ? 'Publikasi' : 'Draf'}
                </button>
              </div>
            </div>

            {/* Area Setting Meta Data */}
            <div className='w-full max-w-5xl mx-auto px-4 py-8 space-y-6'>
              {/* Judul Proporsional */}
              <input
                type='text'
                value={formData.judul}
                onChange={handleTitleChange}
                placeholder='Tuliskan Judul Di Sini...'
                className='w-full text-2xl md:text-3xl font-bold text-slate-800 border-none bg-transparent outline-none placeholder:text-slate-300'
              />

              <div className='flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm'>
                <div className='flex-1 space-y-1'>
                  <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                    Tipe Konten
                  </label>
                  <input
                    list='tipe-konten'
                    value={formData.tipe}
                    onChange={(e) =>
                      setForm({ ...formData, tipe: e.target.value })
                    }
                    placeholder='Ketik atau Pilih...'
                    className='w-full font-bold text-slate-700 outline-none text-sm'
                  />
                  <datalist id='tipe-konten'>
                    <option value='Artikel' />
                    <option value='Video' />
                    <option value='Khutbah' />
                    <option value='Podcast' />
                  </datalist>
                </div>
                <div className='w-px bg-slate-100 hidden md:block'></div>
                <div className='flex-1 space-y-1'>
                  <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                    Kategori Topik
                  </label>
                  <input
                    type='text'
                    value={formData.kategori}
                    onChange={(e) =>
                      setForm({ ...formData, kategori: e.target.value })
                    }
                    placeholder='Misal: Fiqh / Sirah'
                    className='w-full font-bold text-slate-700 outline-none text-sm'
                  />
                </div>
                <div className='w-px bg-slate-100 hidden md:block'></div>
                <div className='flex-1 space-y-1'>
                  <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                    Penulis
                  </label>
                  <input
                    type='text'
                    value={formData.penulis}
                    onChange={(e) =>
                      setForm({ ...formData, penulis: e.target.value })
                    }
                    placeholder='Nama Penulis'
                    className='w-full font-bold text-slate-700 outline-none text-sm'
                  />
                </div>
              </div>

              {/* Cover Image Set dengan Upload AVIF API MNI */}
              <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6'>
                {/* Area Klik/Upload */}
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className='relative group w-full md:w-56 h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-teal-400 transition-colors'>
                  {isUploadingCover ? (
                    <div className='flex flex-col items-center'>
                      <Loader2 className='w-6 h-6 animate-spin text-teal-600 mb-2' />
                      <span className='text-[10px] font-bold text-teal-600'>
                        MENGUNGGAH...
                      </span>
                    </div>
                  ) : formData.cover_url ? (
                    <img
                      src={formData.cover_url}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='flex flex-col items-center text-slate-400'>
                      <UploadCloud className='w-8 h-8 mb-2' />
                      <span className='text-[10px] font-bold'>
                        KLIK UNTUK UPLOAD
                      </span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  {formData.cover_url && !isUploadingCover && (
                    <div className='absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Edit3 className='w-6 h-6 text-white' />
                    </div>
                  )}
                </div>
                <input
                  type='file'
                  ref={coverInputRef}
                  onChange={handleCoverUpload}
                  accept='image/*'
                  className='hidden'
                />

                {/* URL Manual */}
                <div className='flex-1 w-full'>
                  <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2'>
                    URL Foto Sampul (Otomatis/Manual)
                  </label>
                  <input
                    type='text'
                    value={formData.cover_url}
                    onChange={(e) =>
                      setForm({ ...formData, cover_url: e.target.value })
                    }
                    placeholder='URL gambar akan muncul otomatis setelah Anda upload...'
                    className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-medium text-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all'
                  />
                  <p className='text-[10px] text-slate-400 mt-2'>
                    * Gambar akan otomatis dikompres ke format AVIF super ringan
                    via API.
                  </p>
                </div>
              </div>
            </div>

            {/* Rich Text Editor Bawah */}
            <div className='w-full flex-1 flex flex-col items-center px-4 pb-20'>
              <RichTextEditor
                showSource={showSource}
                value={formData.konten}
                onChange={(val) => setForm({ ...formData, konten: val })}
              />

              {/* Toggle Publish Elegan di bawah */}
              <div className='mt-8 flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='pub'
                  checked={formData.is_published}
                  onChange={(e) =>
                    setForm({ ...formData, is_published: e.target.checked })
                  }
                  className='w-5 h-5 accent-teal-600'
                />
                <label
                  htmlFor='pub'
                  className='text-sm font-bold text-slate-500 cursor-pointer'>
                  Status Konten:{' '}
                  <span
                    className={
                      formData.is_published ? 'text-teal-600' : 'text-amber-500'
                    }>
                    {formData.is_published
                      ? 'TAYANG (LIVE)'
                      : 'DRAF (SEMBUNYI)'}
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

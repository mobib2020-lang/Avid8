import React, { useState } from 'react';
import {
  X,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Download,
  Share2,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  User,
  Building2,
  Eye,
  Star,
  Play,
  Pause,
  Volume2,
  RotateCcw,
  BookOpen,
  Tag,
  Check,
} from 'lucide-react';
import { EducationItem } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';
import { downloadEducationFile } from '../../utils/downloadHelpers';

interface EducationFileViewerModalProps {
  item: EducationItem | null;
  onClose: () => void;
  onToggleStar?: (id: string) => void;
}

export const EducationFileViewerModal: React.FC<EducationFileViewerModalProps> = ({
  item,
  onClose,
  onToggleStar,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(28);
  const [activeTab, setActiveTab] = useState<'content' | 'details' | 'notes'>('content');
  const [copied, setCopied] = useState<boolean>(false);

  if (!item) return null;

  const handleDownload = () => {
    downloadEducationFile(item);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[80] flex items-center justify-center p-3 sm:p-6 dir-rtl font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Modal Window Header */}
        <div className="p-4 px-6 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs">
              {item.type === 'pdf' ? (
                <FileText className="w-5 h-5 text-rose-600" />
              ) : item.type === 'video' ? (
                <Video className="w-5 h-5 text-indigo-600" />
              ) : item.type === 'audio' ? (
                <Music className="w-5 h-5 text-amber-600" />
              ) : item.type === 'image' ? (
                <ImageIcon className="w-5 h-5 text-emerald-600" />
              ) : (
                <BookOpen className="w-5 h-5 text-sky-600" />
              )}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800 truncate" title={item.name}>
                  {item.name}
                </h3>
                {item.starred && (
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                <span className="font-mono">{item.size || 'سند متنی'}</span>
                <span>•</span>
                <span>{item.department || 'آموزش بیمارستان'}</span>
                <span>•</span>
                <span>ویرایش: {item.updatedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleStar && (
              <button
                onClick={() => onToggleStar(item.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  item.starred
                    ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                title={item.starred ? 'حذف از نشان‌دارها' : 'افزودن به نشان‌دارها'}
              >
                <Star className={`w-4 h-4 ${item.starred ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="کپی لینک مستقیم"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
              title="دانلود فایل"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="چاپ فایل"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer mr-1"
              title="بستن پنجره"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-3 font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'content'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              محتوای آموزشی
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              مشخصات و شناسنامه سند
            </button>
          </div>

          {/* Zoom controls for documents / PDFs */}
          {activeTab === 'content' && (item.type === 'pdf' || item.type === 'document' || item.type === 'image') && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(70, prev - 15))}
                className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                title="کوچک‌نمایی"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono px-1 font-bold">{toPersianNumber(zoomLevel)}%</span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(150, prev + 15))}
                className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                title="بزرگ‌نمایی"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60">
          {activeTab === 'content' ? (
            <div>
              {/* PDF & Document Reader View */}
              {(item.type === 'pdf' || item.type === 'document') && (
                <div
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-8 mx-auto max-w-2xl transition-all space-y-5"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-sky-700 font-bold">
                      <BookOpen className="w-4 h-4" />
                      <span>سامانه آموزش و توانمندسازی آوید</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      {item.extension || '.PDF'}
                    </span>
                  </div>

                  <div className="prose prose-slate max-w-none text-right">
                    {item.content ? (
                      <div className="space-y-4 text-xs leading-relaxed text-slate-800 whitespace-pre-line">
                        {item.content}
                      </div>
                    ) : (
                      <div className="text-center py-12 space-y-3">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-500 font-bold">سند آموزشی با موفقیت بارگذاری شده است.</p>
                        <p className="text-[11px] text-slate-400">جهت مطالعه کامل، از دکمه دانلود استفاده فرمایید.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>واحد مدیریت آموزش و توسعه مهندسی بیمارستان</span>
                    <span>صفحه ۱ از {item.duration || '۱'}</span>
                  </div>
                </div>
              )}

              {/* Video Player View */}
              {item.type === 'video' && (
                <div className="bg-slate-900 rounded-3xl p-6 text-white max-w-3xl mx-auto space-y-4 shadow-xl">
                  {/* Simulated Video Player Screen */}
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center group border border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 pointer-events-none">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold bg-black/60 px-3 py-1 rounded-lg backdrop-blur-xs">
                          {item.name}
                        </span>
                        <span className="text-xs font-mono bg-rose-600 px-2 py-0.5 rounded-md font-bold">
                          HD 1080p
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>زمان پخش: {item.duration || '۲۰:۰۰'}</span>
                        <span>آموزش عملی ویدئویی</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-sky-600/90 hover:bg-sky-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer z-10"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                  </div>

                  {/* Video Control Bar */}
                  <div className="space-y-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    {/* Time bar */}
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden cursor-pointer">
                      <div className="bg-sky-500 h-full w-1/3 rounded-full" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="hover:text-white cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <Volume2 className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                        <span className="font-mono text-[11px]">۰۷:۱۲ / {item.duration || '۲۰:۰۰'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] bg-slate-700 px-2 py-0.5 rounded font-mono">1.0x</span>
                        <Maximize2 className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  {/* Video Summary Content */}
                  {item.content && (
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-sky-400" />
                        خلاصه و سرفصل‌های کارگاه:
                      </h4>
                      {item.content}
                    </div>
                  )}
                </div>
              )}

              {/* Audio Player View */}
              {item.type === 'audio' && (
                <div className="bg-white rounded-3xl p-8 max-w-xl mx-auto space-y-6 shadow-sm border border-slate-200 text-center">
                  <div className="w-24 h-24 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                    <Music className="w-12 h-12" />
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-800">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.author} • {item.department}</p>
                  </div>

                  {/* Waveform Scrubber Simulation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>۰۷:۳۰</span>
                      <span>{item.duration || '۲۶:۱۵'}</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={audioProgress}
                      onChange={(e) => setAudioProgress(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setAudioProgress((p) => Math.max(0, p - 10))}
                      className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="۱۰ ثانیه قبل"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>

                    <button className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {item.content && (
                    <div className="text-right bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
                      <span className="font-bold">توضیحات صوت: </span>
                      {item.content}
                    </div>
                  )}
                </div>
              )}

              {/* Image / Poster View */}
              {item.type === 'image' && (
                <div className="bg-white rounded-3xl p-6 max-w-2xl mx-auto space-y-4 shadow-sm border border-slate-200 text-center">
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-4">
                    <div className="w-full aspect-4/3 bg-gradient-to-br from-slate-100 to-sky-50 rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-300 p-6 space-y-3">
                      <ImageIcon className="w-16 h-16 text-sky-500" />
                      <span className="font-extrabold text-slate-800 text-sm">{item.name}</span>
                      <span className="text-xs text-slate-500 max-w-md">{item.description}</span>
                    </div>
                  </div>

                  {item.content && (
                    <div className="text-right bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed">
                      {item.content}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Document Details / Metadata Tab */
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-black text-xl">
                  ℹ
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-800">{item.name}</h4>
                  <p className="text-xs text-slate-500">شناسنامه و اطلاعات متادیتای سند در پایگاه آموزش آوید</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                    <User className="w-3.5 h-3.5" />
                    <span>بارگذاری‌کننده / مولف:</span>
                  </div>
                  <div className="font-extrabold text-slate-800">{item.author}</div>
                  {item.authorRole && (
                    <span className="text-[10px] text-slate-500">{item.authorRole}</span>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>دپارتمان مربوطه:</span>
                  </div>
                  <div className="font-extrabold text-slate-800">{item.department || 'عمومی بیمارستان'}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاریخ ایجاد و آخرین بروزرسانی:</span>
                  </div>
                  <div className="font-extrabold text-slate-800 font-mono">{item.updatedAt}</div>
                  <span className="text-[10px] text-slate-400 font-mono">ایجاد: {item.createdAt}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>آمار بازدید و دانلود:</span>
                  </div>
                  <div className="font-extrabold text-slate-800 font-mono">
                    {toPersianNumber(item.viewCount || 0)} بازدید • {toPersianNumber(item.downloadCount || 0)} دانلود
                  </div>
                </div>
              </div>

              {item.description && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-600">شرح و خلاصه سند:</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-600">برچسب‌ها و دسته‌بندی موضوعی:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-lg font-bold"
                      >
                        <Tag className="w-3 h-3 text-sky-500" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>سامانه آموزش داخلی بیمارستان آوید (LMS داخلی)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دریافت فایل</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

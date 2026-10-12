import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Drum,
  Music,
  Sparkles,
  Volume2,
  CheckCircle2,
} from 'lucide-react';

interface MusicHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Web Audio API synthesizer for kindergarten percussion instruments
function playSynthesizedInstrument(type: 'phach_tre' | 'xac_xo' | 'trong_lac') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'phach_tre') {
      // Wood block / bamboo claves click: snappy resonant wood hit
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'xac_xo') {
      // Tambourine jingle / shaker: metallic burst
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 4500;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === 'trong_lac') {
      // Pellete drum: twin soft thumps
      [0, 0.08].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + delay + 0.07);

        gain.gain.setValueAtTime(0.7, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.08);
      });
    }
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

export const MusicHandbookModal: React.FC<MusicHandbookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'nhac_cu' | 'tiet_tau' | 'phuong_phap'>('nhac_cu');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Cẩm Nang Giáo Dục Âm Nhạc Mầm Non
              </h3>
              <p className="text-xs text-emerald-100">
                Tài liệu nghiệp vụ chuyên môn · Trường Mầm non Hải Tân
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-2">
          <button
            onClick={() => setActiveTab('nhac_cu')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'nhac_cu'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Nhạc cụ gõ mầm non
          </button>
          <button
            onClick={() => setActiveTab('tiet_tau')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'tiet_tau'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4 Cách gõ đệm cơ bản
          </button>
          <button
            onClick={() => setActiveTab('phuong_phap')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'phuong_phap'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Phương pháp sư phạm
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-slate-700">
          {activeTab === 'nhac_cu' && (
            <div className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Trường Mầm non Hải Tân chú trọng trang bị bộ gõ mầm non đa dạng giúp trẻ làm quen với các âm sắc phong phú và phát triển vận động tinh của đôi bàn tay.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Phách tre */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-amber-900 text-sm">Phách tre mầm non</h4>
                      <Drum className="w-4 h-4 text-amber-700" />
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      2 thanh tre già dài 12-15cm, âm thanh giòn vang, chắc nịch. Thích hợp rèn luyện gõ tiết tấu chậm và gõ theo phách cho trẻ mẫu giáo.
                    </p>
                  </div>
                  <button
                    onClick={() => playSynthesizedInstrument('phach_tre')}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe tiếng phách</span>
                  </button>
                </div>

                {/* Xắc xô */}
                <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-teal-900 text-sm">Xắc xô (Lục lạc)</h4>
                      <Sparkles className="w-4 h-4 text-teal-700" />
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Vành tròn gắn các lá kim loại mỏng rung leng keng. Trẻ cầm lắc nhẹ theo cổ tay hoặc vỗ vào lòng bàn tay theo giai điệu vui tươi.
                    </p>
                  </div>
                  <button
                    onClick={() => playSynthesizedInstrument('xac_xo')}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-teal-900 bg-teal-200/80 hover:bg-teal-300 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe tiếng xắc xô</span>
                  </button>
                </div>

                {/* Trống lắc */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-emerald-900 text-sm">Trống lắc tay</h4>
                      <Drum className="w-4 h-4 text-emerald-700" />
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Trống bọc da hai mặt có 2 hạt gõ đong đưa. Trẻ xoay nhẹ cán trống để tạo âm thanh nhộn nhịp, rất phù hợp cho lứa tuổi Nhà trẻ & 3-4 tuổi.
                    </p>
                  </div>
                  <button
                    onClick={() => playSynthesizedInstrument('trong_lac')}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-200/80 hover:bg-emerald-300 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe tiếng trống lắc</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tiet_tau' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <h4 className="font-bold text-slate-900 mb-1">1. Gõ theo phách (Vỗ theo phách)</h4>
                <p className="text-xs text-slate-600">
                  Gõ đều đặn vào từng phách của bài hát (cả phách mạnh và phách nhẹ đều gõ). Dễ tập cho trẻ 3-4 tuổi và 4-5 tuổi.
                </p>
                <div className="mt-2 text-xs font-mono text-teal-800 bg-white p-2 rounded-lg border border-slate-200">
                  Công thức: Gõ - Gõ - Gõ - Gõ (đều đặn liên tục theo nhịp phách)
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <h4 className="font-bold text-slate-900 mb-1">2. Gõ theo nhịp</h4>
                <p className="text-xs text-slate-600">
                  Chỉ gõ vào phách mạnh ở đầu mỗi ô nhịp, các phách nhẹ mở tay hoặc nghỉ. Tạo cảm giác thong thả, êm dịu.
                </p>
                <div className="mt-2 text-xs font-mono text-teal-800 bg-white p-2 rounded-lg border border-slate-200">
                  Công thức: Gõ (mạnh) - Mở/Nghỉ - Gõ (mạnh) - Mở/Nghỉ
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <h4 className="font-bold text-slate-900 mb-1">3. Gõ theo tiết tấu chậm</h4>
                <p className="text-xs text-slate-600">
                  Gõ 3 tiếng liên tiếp rồi mở/nghỉ 1 tiếng (áp dụng nhiều cho trẻ mẫu giáo lớn 5-6 tuổi ở bài hát nhịp 4/4).
                </p>
                <div className="mt-2 text-xs font-mono text-teal-800 bg-white p-2 rounded-lg border border-slate-200">
                  Công thức: Cốc (1) - Cốc (2) - Cốc (3) - Nghỉ/Mở (4)
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <h4 className="font-bold text-slate-900 mb-1">4. Gõ theo tiết tấu phối hợp</h4>
                <p className="text-xs text-slate-600">
                  Gõ đệm theo âm hình tiết tấu đặc trưng của bài hát hoặc kết hợp vỗ tay, dậm chân, gõ đùi rèn luyện phối hợp đa giác quan.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'phuong_phap' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <h4 className="font-bold text-teal-900 mb-1">Phương pháp Orff-Schulwerk trong giáo dục mầm non</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Trẻ em học âm nhạc tự nhiên thông qua chơi đùa, lời đồng dao, vần điệu và vận động thân thể (body percussion: vỗ tay, búng tay, dậm chân). Không ép buộc trẻ ngồi im nghe lý thuyết mà để trẻ tự khám phá âm thanh xung quanh.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-1">Lời khuyên khi tổ chức hoạt động âm nhạc tại MN Hải Tân</h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Khởi động giọng hát bằng các trò chơi bắt chước tiếng kêu con vật hoặc còi xe vui nhộn.</li>
                  <li>Cho trẻ nghe mẫu trọn vẹn bài hát với tình cảm diễn cảm của cô trước khi chia câu tập hát.</li>
                  <li>Khuyến khích trẻ sáng tạo động tác múa phụ họa tự nhiên, không gò bó rập khuôn.</li>
                  <li>Lồng ghép luân phiên giữa hoạt động tĩnh (nghe hát) và hoạt động động (trò chơi âm nhạc).</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 cursor-pointer"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Check, ChevronRight, BarChart3, AlertTriangle, RotateCcw, Clock } from 'lucide-react';

// --- [DATA SCHEMA] ---
const FIELD_SCHEMA: any = {
  WEEK1: [
    { id: 'hw_scratch', label: '스크래치 발생 (발톱/클립)', type: 'boolean', critical: true },
    { id: 'hw_stain', label: '오염 제거 난이도 (1:쉬움 ~ 5:안지워짐)', type: 'scale' },
    { id: 'hw_tilt', label: '전도(넘어짐) 위험', type: 'boolean', critical: true },
    { id: 'hw_cable', label: '케이블/포트 노출 여부', type: 'boolean', critical: true },
    { id: 'hw_heat', label: '부스 내부 온도', type: 'select', options: ['쾌적함', '미지근함', '뜨거움'] }
  ],
  WEEK2: [
    { id: 'ux_onehand', label: '한 손 조작 편의성 (1:불편 ~ 5:편함)', type: 'scale' },
    { id: 'ux_angle', label: '카메라 앵글 (강아지)', type: 'select', options: ['잘림(Fail)', '적절함', '여백 과다'] },
    { id: 'ux_attention', label: 'Dog Attention (1:무시 ~ 5:응시)', type: 'scale' },
    { id: 'ux_time', label: '세션 총 소요 시간', type: 'number' } // 이제 이 항목이 정상 작동합니다.
  ],
  WEEK3: [
    { id: 'op_focus', label: '사진 초점 상태', type: 'select', options: ['선명함', '흔들림', '초점 나감'] },
    { id: 'op_jam', label: '인화지 출력 상태', type: 'select', options: ['정상', '잼(Jam)', '색감 이상'] },
    { id: 'op_speed', label: '시스템 반응 속도 (1:느림 ~ 5:빠름)', type: 'scale' }
  ]
};

export default function PawPrintApp() {
  // --- [STATE MANAGEMENT] ---
  const [viewMode, setViewMode] = useState<'INPUT' | 'DASHBOARD'>('INPUT');
  const [step, setStep] = useState(0); 
  const [week, setWeek] = useState('WEEK1');
  
  const [currentData, setCurrentData] = useState<any>({
    testerId: '', location: '', dogSize: '', dogBreed: '', images: {}
  });
  
  const [logs, setLogs] = useState<any[]>([]);

  // --- [HANDLERS] ---
  const updateData = (key: string, value: any) => {
    setCurrentData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCurrentData((prev: any) => ({
        ...prev,
        images: { ...prev.images, [fieldId]: imageUrl }
      }));
    }
  };

  const submitLog = () => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      week: week,
      ...currentData
    };
    setLogs([newLog, ...logs]);
    setStep(2);
  };

  const resetForm = () => {
    setCurrentData({ testerId: currentData.testerId, location: '', dogSize: '', dogBreed: '', images: {} });
    setStep(0);
  };

  // --- [DASHBOARD LOGIC] ---
  const calculateKPI = () => {
    const total = logs.length;
    if (total === 0) return null;

    const criticalFails = logs.filter(l => 
      l.hw_scratch === 'FAIL' || l.hw_tilt === 'FAIL' || l.hw_cable === 'FAIL'
    ).length;

    const satisfactionScores = logs
      .map(l => l.ux_onehand || l.ux_attention)
      .filter(v => typeof v === 'number');
    const avgScore = satisfactionScores.length > 0 
      ? (satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length).toFixed(1) 
      : 'N/A';

    return { total, criticalFails, avgScore };
  };

  const kpi = calculateKPI();

  // --- [RENDER] ---
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <header className="bg-black text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2" onClick={() => setViewMode('INPUT')}>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <h1 className="font-bold text-lg cursor-pointer">LifePawCut</h1>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={() => setViewMode(viewMode === 'INPUT' ? 'DASHBOARD' : 'INPUT')}>
             {viewMode === 'INPUT' ? <BarChart3 className="w-4 h-4 mr-1"/> : <RotateCcw className="w-4 h-4 mr-1"/>}
             {viewMode === 'INPUT' ? 'Dashboard' : 'Input'}
           </Button>
        </div>
      </header>

      <main className="p-4">
        {viewMode === 'DASHBOARD' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-4">📊 Field Test Status</h2>
            {!kpi ? (
              <div className="text-center text-gray-500 py-10">데이터가 아직 없습니다.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{kpi.total}</span>
                      <span className="text-xs text-gray-500 uppercase">Total Sessions</span>
                    </CardContent>
                  </Card>
                  <Card className={`${kpi.criticalFails > 0 ? 'bg-red-50 border-red-200' : ''}`}>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${kpi.criticalFails > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {kpi.criticalFails}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">Critical Defects</span>
                    </CardContent>
                  </Card>
                  <Card className="col-span-2">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 uppercase block">Avg. UX Score</span>
                        <span className="text-2xl font-bold">{kpi.avgScore} <span className="text-sm text-gray-400">/ 5.0</span></span>
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-gray-400">Target: 4.5</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-6">
                  <h3 className="font-bold text-sm mb-2 text-gray-600">Recent Logs</h3>
                  <div className="space-y-2">
                    {logs.map((log, idx) => (
                      <Card key={idx} className="p-3 text-sm flex justify-between items-center">
                        <div>
                          <span className="font-bold block">Test #{logs.length - idx}</span>
                          <span className="text-xs text-gray-500">{log.timestamp} | {log.dogSize}견</span>
                        </div>
                        {log.hw_scratch === 'FAIL' || log.hw_tilt === 'FAIL' ? (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">FAIL</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-bold">PASS</span>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {viewMode === 'INPUT' && (
          <>
            {step === 0 && (
              <Card className="animate-in slide-in-from-right">
                <CardHeader><CardTitle>1. 기본 정보 (Context)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">테스트 주차</label>
                    <select className="w-full p-2 border rounded mt-1 text-sm" value={week} onChange={(e) => setWeek(e.target.value)}>
                      <option value="WEEK1">Week 1: 하드웨어 & 안전</option>
                      <option value="WEEK2">Week 2: UX & Flow</option>
                      <option value="WEEK3">Week 3: 운영 & 결과</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="테스터 ID" value={currentData.testerId} onChange={(e) => updateData('testerId', e.target.value)} />
                    <Input placeholder="견종 (예: 푸들)" value={currentData.dogBreed} onChange={(e) => updateData('dogBreed', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">반려견 크기 (필수)</label>
                    <div className="flex gap-2 mt-1">
                      {['소형', '중형', '대형'].map((size) => (
                        <Button key={size} variant={currentData.dogSize === size ? "default" : "outline"} onClick={() => updateData('dogSize', size)} className="flex-1 text-xs">
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setStep(1)} disabled={!currentData.dogSize}>Start Test <ChevronRight className="w-4 h-4 ml-2"/></Button>
                </CardFooter>
              </Card>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right">
                {FIELD_SCHEMA[week].map((field: any) => (
                  <Card key={field.id} className="border-l-4 border-l-black shadow-sm">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <label className="font-bold text-sm flex items-center gap-2">
                          {field.label}
                          {field.critical && <span className="text-red-500 text-xs bg-red-50 px-1 rounded">필수</span>}
                        </label>
                      </div>

                      {/* [NEW] Number Type Handler */}
                      {field.type === 'number' && (
                        <div className="flex items-center gap-2">
                           <Clock className="w-5 h-5 text-gray-400"/>
                           <Input 
                             type="number" 
                             placeholder="0" 
                             className="text-right font-bold text-lg"
                             value={currentData[field.id] || ''}
                             onChange={(e) => updateData(field.id, e.target.value)}
                           />
                           <span className="text-sm font-bold text-gray-500 w-16">초 (sec)</span>
                        </div>
                      )}

                      {/* Boolean Type */}
                      {field.type === 'boolean' && (
                        <div className="flex gap-2">
                          <Button 
                            variant={currentData[field.id] === 'PASS' ? "default" : "outline"} 
                            className={`flex-1 ${currentData[field.id] === 'PASS' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            onClick={() => updateData(field.id, 'PASS')}
                          >PASS</Button>
                          <Button 
                            variant={currentData[field.id] === 'FAIL' ? "destructive" : "outline"}
                            className="flex-1"
                            onClick={() => updateData(field.id, 'FAIL')}
                          >FAIL</Button>
                        </div>
                      )}

                      {/* Scale Type */}
                      {field.type === 'scale' && (
                        <div className="flex justify-between bg-gray-100 p-2 rounded-lg">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button key={num} onClick={() => updateData(field.id, num)}
                              className={`w-8 h-8 rounded-full text-sm font-bold ${currentData[field.id] === num ? 'bg-black text-white shadow' : 'bg-white text-gray-400'}`}>
                              {num}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Select Type */}
                      {field.type === 'select' && (
                         <div className="flex flex-wrap gap-2">
                           {field.options.map((opt:string) => (
                             <button key={opt} onClick={() => updateData(field.id, opt)}
                               className={`px-3 py-2 text-xs rounded-full border ${currentData[field.id] === opt ? 'bg-black text-white' : 'bg-white text-gray-600'}`}>
                               {opt}
                             </button>
                           ))}
                         </div>
                      )}

                      {/* Image Upload Trigger */}
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                        {currentData.images[field.id] ? (
                          <div className="relative w-full h-32 bg-black rounded-lg overflow-hidden">
                            <img src={currentData.images[field.id]} alt="Evidence" className="w-full h-full object-cover" />
                            <button onClick={() => {
                                const newImages = {...currentData.images};
                                delete newImages[field.id];
                                setCurrentData({...currentData, images: newImages});
                            }} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded">삭제</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                             <span className="text-xs text-gray-400 flex gap-1"><AlertTriangle className="w-3 h-3"/> 증빙 사진 필요시 첨부</span>
                             <label htmlFor={`file-${field.id}`} className="cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded text-xs flex items-center gap-1 transition-all">
                               <Camera className="w-3 h-3"/> 사진 추가
                             </label>
                             <input id={`file-${field.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(field.id, e)} />
                          </div>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardContent className="pt-4">
                    <label className="text-sm font-bold mb-2 block">종합 의견</label>
                    <Textarea placeholder="특이사항 입력..." onChange={(e) => updateData('comment', e.target.value)} />
                  </CardContent>
                </Card>

                <Button className="w-full h-12 text-lg shadow-xl" onClick={submitLog}>제출 (Submit)</Button>
              </div>
            )}

            {step === 2 && (
              <div className="text-center space-y-6 animate-in zoom-in-95 py-10">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">전송 완료</h2>
                  <p className="text-gray-500 text-sm mt-1">본부 데이터베이스에 안전하게 기록되었습니다.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button className="w-full" onClick={resetForm} variant="outline">다음 테스트 계속하기</Button>
                  <Button className="w-full" onClick={() => setViewMode('DASHBOARD')}>대시보드 확인하기</Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
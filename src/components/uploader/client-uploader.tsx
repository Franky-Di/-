'use client';

import { useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Download, Upload } from 'lucide-react';

export interface ClientUploaderProps {
  maxFiles?: number;
}

export function ClientUploader({ maxFiles = 50 }: ClientUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState('');
  const [start, setStart] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files;
    if (!selected) return;
    const list = Array.from(selected).slice(0, maxFiles);
    setFiles(list);
    setError(null);
  }

  async function handleSubmit() {
    if (!files.length) return setError('请先选择图片');
    setIsLoading(true);
    setError(null);
    setProgress(10);

    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    form.append('prefix', prefix.trim());
    form.append('start', String(start || 1));

    try {
      const res = await fetch('/api/process-images', { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      setProgress(75);
      const blob = await res.blob();
      setProgress(90);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images.zip';
      link.click();
      URL.revokeObjectURL(url);
      setProgress(100);
    } catch (err) {
      const message = err instanceof Error ? err.message : '处理失败';
      setError(message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col gap-3">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePick}
        />
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            placeholder="命名前缀（可选）"
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
          />
          <Input
            type="number"
            min={1}
            className="md:w-32"
            value={start}
            onChange={(event) => setStart(Number(event.target.value) || 1)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            选择图片
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            {isLoading ? '处理中...' : '开始处理'}
          </Button>
        </div>
      </div>

      {progress > 0 ? <Progress value={progress} /> : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>出错了</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <p className="text-xs text-slate-500">
        限制：每次最多 {maxFiles} 张，每张 ≤10MB。输出：裁剪 1000×1000，压缩约
        200–300KB，批量重命名为 .webp 并打包 ZIP 自动下载。
      </p>
    </Card>
  );
}


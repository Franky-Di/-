import { ClientUploader } from '@/components/uploader/client-uploader';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">裁剪 · 压缩 · 重命名 · WebP</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            批量图片处理与打包下载
          </h1>
          <p className="text-sm text-slate-600">
            上传图片后自动裁剪为 1000×1000，压缩到约 200–300KB，批量重命名并导出 .webp，最终一键打包 ZIP 下载。
          </p>
        </div>
        <ClientUploader />
      </section>
    </main>
  );
}

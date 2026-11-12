import { ReactNode } from 'react'

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white">
        $
      </div>
      <span className={`text-lg font-semibold ${dark ? 'text-white' : 'text-neutral-950'}`}>Finanças</span>
    </div>
  )
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-500" />
        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full border-[28px] border-neutral-950" />
        <Logo dark />
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight">
            Cada gasto anotado,
            <br />
            <span className="text-orange-500">cada mês sob controle.</span>
          </h2>
          <p className="mt-4 text-neutral-400">
            Registre suas contas, acompanhe a evolução dos gastos e veja para onde o dinheiro está indo.
          </p>
        </div>
        <p className="relative text-sm text-neutral-500">© {new Date().getFullYear()} Finanças</p>
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-semibold text-neutral-950">{title}</h1>
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">{children}</div>
        </div>
      </section>
    </main>
  )
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...input } = props
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</span>
      <input
        {...input}
        className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
      />
    </label>
  )
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-neutral-950 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
    >
      {loading ? 'Aguarde...' : children}
    </button>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </p>
  )
}
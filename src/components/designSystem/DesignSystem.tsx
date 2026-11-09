import { colors } from '../../constants/colors';
import { useI18n } from '../../hooks/useI18n';
import {
  Button,
  CalendarIcon,
  Checkbox,
  HomeIcon,
  Input,
  LanguageToggle,
  LogoutIcon,
  MenuIcon,
  PanelIcon,
  PlusIcon,
  RoleBird,
  SearchIcon,
  Select,
  TextArea,
  TrashIcon,
  UserIcon,
} from '../ui';
import { ColorScale } from './ColorScale';
import { Specimen } from './Specimen';

const SECTIONS = [
  'colors', 'roles', 'perch', 'typography', 'buttons', 'inputs',
  'textarea', 'select', 'checkbox', 'languageToggle', 'roleBird', 'icons',
] as const;

const BUTTON_VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'success', 'warning', 'error'] as const;
const BUTTON_SIZES = ['sm', 'md', 'lg', 'xl'] as const;

const ICONS = [
  ['HomeIcon', HomeIcon], ['UserIcon', UserIcon], ['SearchIcon', SearchIcon], ['CalendarIcon', CalendarIcon],
  ['PlusIcon', PlusIcon], ['TrashIcon', TrashIcon], ['LogoutIcon', LogoutIcon], ['MenuIcon', MenuIcon],
  ['PanelIcon', PanelIcon],
] as const;

// Each role tint pairs a light background with a dark foreground from the same bird.
const ROLE_TONES = [
  { key: 'mentor', token: 'primary', className: 'bg-primary-100 text-primary-700' },
  { key: 'mentee', token: 'secondary', className: 'bg-secondary-100 text-secondary-700' },
  { key: 'shared', token: 'teal', className: 'bg-teal-100 text-teal-700' },
  { key: 'other', token: 'neutral', className: 'bg-neutral-100 text-neutral-700' },
] as const;

const TYPE_SCALE = [
  { key: 'pageTitle', classes: 'text-3xl font-semibold tracking-tight sm:text-4xl' },
  { key: 'sectionTitle', classes: 'text-2xl font-semibold tracking-tight' },
  { key: 'cardTitle', classes: 'text-lg font-medium' },
  { key: 'body', classes: 'text-base leading-relaxed' },
  { key: 'secondary', classes: 'text-sm text-neutral-600' },
] as const;

const CODE = {
  colors: `
// Tailwind classes, generated from the @theme block in src/index.css
<p className="text-neutral-800">Body text in ink</p>
<a className="text-primary-700">Link</a>
<div className="bg-neutral-50">Paper</div>

// Raw values, when a class is not an option
import { colors } from '../constants/colors';
colors.primary[600]; // '#2F74C8'`,
  roles: `
<span className="bg-primary-100 text-primary-700">   {/* mentor */}
<span className="bg-secondary-100 text-secondary-700">  {/* mentee */}
<span className="bg-teal-100 text-teal-700">      {/* shared */}`,
  perch: `<div aria-hidden="true" className="h-1.5 rounded-full bg-perch" />`,
  typography: `
<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">…</h1>
<h2 className="text-2xl font-semibold tracking-tight">…</h2>
<h3 className="text-lg font-medium">…</h3>
<p className="text-sm text-neutral-600">…</p>`,
  buttons: `
import { Button, PlusIcon } from './ui';

<Button onClick={save}>Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button leftIcon={<PlusIcon />}>Add contact</Button>
<Button type="submit" isLoading={saving} fullWidth>Save</Button>`,
  inputs: `
import { Input, SearchIcon } from './ui';

<Input label="Email" type="email" helperText="We never share it." fullWidth />
<Input label="Email" variant="error" helperText="Enter a valid email." isRequired />
<Input label="Search" leftIcon={<SearchIcon />} />`,
  textarea: `<TextArea label="Expectations" rows={4} helperText="…" fullWidth />`,
  select: `
<Select label="Contact type" value={type} onChange={(e) => setType(e.target.value)}>
  <option value="EMAIL">Email</option>
  <option value="PHONE">Phone</option>
</Select>`,
  checkbox: `<Checkbox label="Preferred contact" checked={checked} onChange={(e) => setChecked(e.target.checked)} />`,
  languageToggle: `<LanguageToggle className="absolute top-4 right-4" />`,
  roleBird: `
import { RoleBird } from './ui';

<RoleBird role="MENTOR" />          {/* 40px, next to a role title */}
<RoleBird role="MENTEE" size="sm" /> {/* 24px, next to a user name */}`,
  icons: `
import { TrashIcon } from './ui';

// Icons are decorative: the control carries the accessible name.
<Button variant="ghost" aria-label="Remove English"><TrashIcon /></Button>`,
} as const;

export function DesignSystem() {
  const { t } = useI18n();
  const section = (key: (typeof SECTIONS)[number]) => ({
    id: key,
    title: t(`designSystem.sections.${key}.title`),
    description: t(`designSystem.sections.${key}.description`),
    code: CODE[key],
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[12rem_1fr] lg:gap-16">
      <nav aria-label={t('designSystem.navLabel')} className="lg:sticky lg:top-10 lg:self-start">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm lg:flex-col">
          {SECTIONS.map((key) => (
            <li key={key}>
              <a href={`#${key}`} className="text-neutral-600 hover:text-primary-700 hover:underline">
                {t(`designSystem.sections.${key}.title`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex min-w-0 flex-col gap-16">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight">{t('designSystem.title')}</h1>
            <p className="mt-3 text-lg leading-relaxed text-neutral-600">{t('designSystem.intro')}</p>
          </div>
          <LanguageToggle />
        </header>

        <Specimen {...section('colors')}>
          <div className="flex flex-col gap-6">
            <ColorScale name="primary" scale={colors.primary} />
            <ColorScale name="secondary" scale={colors.secondary} />
            <ColorScale name="teal" scale={colors.teal} />
            <ColorScale name="neutral" scale={colors.neutral} />
            <ColorScale name="success" scale={colors.success} />
            <ColorScale name="warning" scale={colors.warning} />
            <ColorScale name="error" scale={colors.error} />
            <ColorScale name="info" scale={colors.info} />
          </div>
        </Specimen>

        <Specimen {...section('roles')}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_TONES.map((tone) => (
              <li key={tone.key} className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-lg ${tone.className}`}>
                  <SearchIcon />
                </span>
                <span className="text-sm leading-tight">
                  <span className="block font-medium text-neutral-900">{t(`designSystem.roles.${tone.key}`)}</span>
                  <span className="block font-mono text-neutral-600">{tone.token}</span>
                </span>
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen {...section('perch')}>
          <div aria-hidden="true" className="h-1.5 rounded-full bg-perch" />
        </Specimen>

        <Specimen {...section('typography')}>
          <dl className="flex flex-col divide-y divide-neutral-200">
            {TYPE_SCALE.map((row) => (
              <div key={row.key} className="grid gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[12rem_1fr] md:gap-6">
                <dt className="text-sm leading-tight">
                  <span className="block text-neutral-900">{t(`designSystem.type.${row.key}`)}</span>
                  <code className="block text-xs text-neutral-600">{row.classes}</code>
                </dt>
                <dd className={`max-w-prose ${row.classes}`}>{t(`designSystem.type.${row.key}Sample`)}</dd>
              </div>
            ))}
          </dl>
        </Specimen>

        <Specimen {...section('buttons')}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              {BUTTON_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant}>{variant}</Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {BUTTON_SIZES.map((size) => (
                <Button key={size} size={size} variant="outline">{size}</Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button leftIcon={<PlusIcon />}>{t('designSystem.demo.addContact')}</Button>
              <Button isLoading>{t('common.save')}</Button>
              <Button disabled>{t('designSystem.demo.disabled')}</Button>
              <Button variant="ghost" aria-label={t('common.remove')} title={t('common.remove')}>
                <TrashIcon />
              </Button>
            </div>
          </div>
        </Specimen>

        <Specimen {...section('inputs')}>
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label={t('designSystem.demo.email')}
              type="email"
              placeholder={t('designSystem.demo.emailPlaceholder')}
              helperText={t('designSystem.demo.emailHelper')}
              fullWidth
            />
            <Input
              label={t('designSystem.demo.email')}
              defaultValue={t('designSystem.demo.invalidEmail')}
              variant="error"
              helperText={t('designSystem.demo.errorHelper')}
              isRequired
              fullWidth
            />
            <Input
              label={t('designSystem.demo.search')}
              placeholder={t('designSystem.demo.searchPlaceholder')}
              leftIcon={<SearchIcon />}
              fullWidth
            />
            <Input
              label={t('designSystem.demo.disabled')}
              defaultValue={t('designSystem.demo.disabledValue')}
              disabled
              fullWidth
            />
            <Input
              label={t('designSystem.demo.city')}
              defaultValue={t('designSystem.demo.cityValue')}
              variant="success"
              helperText={t('designSystem.demo.successHelper')}
              fullWidth
            />
            <Input
              label={t('designSystem.demo.age')}
              type="number"
              defaultValue={15}
              variant="warning"
              helperText={t('designSystem.demo.warningHelper')}
              fullWidth
            />
          </div>
        </Specimen>

        <Specimen {...section('textarea')}>
          <TextArea
            label={t('designSystem.demo.expectations')}
            placeholder={t('designSystem.demo.expectationsPlaceholder')}
            helperText={t('designSystem.demo.expectationsHelper')}
            rows={4}
            fullWidth
          />
        </Specimen>

        <Specimen {...section('select')}>
          <div className="max-w-xs">
            <Select label={t('designSystem.demo.contactType')} defaultValue="EMAIL">
              <option value="EMAIL">{t('profile.contactTypes.EMAIL')}</option>
              <option value="PHONE">{t('profile.contactTypes.PHONE')}</option>
            </Select>
          </div>
        </Specimen>

        <Specimen {...section('checkbox')}>
          <div className="flex flex-col gap-3">
            <Checkbox label={t('profile.preferentialContact')} defaultChecked />
            <Checkbox label={t('profile.isGraduated')} />
            <Checkbox label={t('designSystem.demo.disabled')} disabled />
          </div>
        </Specimen>

        <Specimen {...section('languageToggle')}>
          <LanguageToggle />
        </Specimen>

        <Specimen {...section('roleBird')}>
          <div className="flex flex-wrap items-center gap-8">
            {(['MENTOR', 'MENTEE'] as const).map((role) => (
              <div key={role} className="flex items-center gap-3">
                <RoleBird role={role} />
                <RoleBird role={role} size="sm" />
                <span className="text-sm font-medium text-neutral-900">{t(`roles.${role}`)}</span>
              </div>
            ))}
          </div>
        </Specimen>

        <Specimen {...section('icons')}>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3">
            {ICONS.map(([name, Icon]) => (
              <li key={name} className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2.5">
                <Icon />
                <code className="truncate text-xs text-neutral-700">{name}</code>
              </li>
            ))}
          </ul>
        </Specimen>
      </main>
    </div>
  );
}

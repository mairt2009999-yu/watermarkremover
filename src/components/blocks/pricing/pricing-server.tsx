import { HeaderSection } from '@/components/layout/header-section';
import { PricingTableServer } from '@/components/pricing/pricing-table-server';
import { getTranslations } from 'next-intl/server';

export default async function PricingSection() {
  const t = await getTranslations('HomePage.pricing');

  return (
    <section id="pricing">
      <div className="mx-auto max-w-6xl px-6 space-y-16">
        <HeaderSection
          subtitle={t('subtitle')}
          subtitleAs="h2"
          subtitleClassName="text-4xl font-bold"
          description={t('description')}
          descriptionAs="p"
        />

        <PricingTableServer />
      </div>
    </section>
  );
}

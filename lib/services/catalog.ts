import { serviceCategories, taxonomyServices } from "@/lib/services/taxonomy";

export type ServiceCatalogCategory = {
  slug: string;
  title: string;
  short: string;
  description: string;
  serviceSlugs: string[];
};

export const serviceCatalog: ServiceCatalogCategory[] = serviceCategories
  .slice()
  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  .map((category) => ({
    slug: category.slug,
    title: category.name,
    short: category.short ?? category.name,
    description: category.description ?? "",
    serviceSlugs: taxonomyServices.filter((service) => service.categoryId === category.id).map((service) => service.slug)
  }));

export function getServiceCategoryBySlug(slug: string) {
  return serviceCatalog.find((item) => item.slug === slug) ?? null;
}

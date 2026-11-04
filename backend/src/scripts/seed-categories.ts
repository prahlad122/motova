import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";

const hierarchy = [
  { name: "Interior Accessories", children: ["Seat Covers", "Floor Mats", "Dashboard Mats", "Steering Wheel Covers", "Neck & Lumbar Cushions", "Car Organizers", "Sunshades", "Interior LED Lights", "Gear Knobs", "Door Sill Plates"] },
  { name: "Exterior Accessories", children: ["Car Body Covers", "Spoilers", "Door Visors", "Mud Flaps", "Door Guards", "Chrome Accessories", "Number Plate Frames", "Bumper Protectors", "Roof Rails", "Car Decals & Stickers"] },
  { name: "Car Electronics & Infotainment", children: ["Android Stereo Systems", "Touchscreen Displays", "Car Speakers", "Subwoofers", "Amplifiers", "Bluetooth Receivers", "GPS Navigation Devices", "Headrest Monitors", "Reverse Camera Displays"] },
  { name: "Safety & Security", children: ["Dash Cameras", "Reverse Cameras", "Parking Sensors", "Blind Spot Mirrors", "Car Alarms", "Steering Wheel Locks", "GPS Trackers", "TPMS (Tyre Pressure Monitoring)", "Emergency Safety Kits"] },
  { name: "Car Lighting", children: ["LED Headlights", "Fog Lights", "DRL Lights", "Tail Lights", "Interior Ambient Lights", "LED Strips", "Number Plate Lights", "Auxiliary Lights"] },
  { name: "Mobile & Charging Accessories", children: ["Mobile Holders", "Wireless Chargers", "USB Chargers", "Fast Car Chargers", "Charging Cables", "Bluetooth FM Transmitters", "Car Power Inverters"] },
  { name: "Car Care & Cleaning", children: ["Car Shampoo", "Microfiber Cloths", "Car Polish", "Dashboard Polish", "Glass Cleaners", "Interior Cleaners", "Cleaning Brushes", "Car Vacuum Cleaners", "Detailing Kits"] },
  { name: "Tyres, Wheels & Accessories", children: ["Alloy Wheels", "Wheel Covers", "Tyre Inflators", "Tyre Repair Kits", "Wheel Locks", "Valve Caps", "Wheel Spacers", "Tyre Pressure Gauges"] },
  { name: "Travel & Utility Accessories", children: ["Roof Carriers", "Roof Boxes", "Luggage Organizers", "Boot Organizers", "Car Hooks", "Portable Fridges", "Travel Pillows", "Cup Holders"] },
  { name: "Performance Accessories", children: ["Performance Air Filters", "Exhaust Tips", "Performance Spark Plugs", "Engine Dress-up Accessories", "Performance Gauges", "Cold Air Intake Kits"] },
  { name: "Comfort & Convenience", children: ["Neck Pillows", "Back Support Cushions", "Portable Fans", "Car Air Purifiers", "Mini Humidifiers", "Seat Gap Fillers", "Window Curtains"] },
  { name: "Car Fragrances", children: ["Car Perfumes", "Air Fresheners", "Vent Clip Fragrances", "Gel Fresheners", "Car Aroma Diffusers", "Fragrance Refills"] },
] as const;

const slugify = (name: string) => name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nameKey = (name: string) => name.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]/gu, "");

type SeedStats = { created: number; reused: number; reparented: number; roots: number; subcategories: number; preservedProducts: number };
let currentCategoryName = "starting transaction";

async function main() {
  const stats = await prisma.$transaction(async (tx): Promise<SeedStats> => {
    const productAssignmentsBefore = await tx.product.findMany({ select: { id: true, categoryId: true }, orderBy: { id: "asc" } });
    const existing = await tx.category.findMany({ include: { _count: { select: { products: true, children: true } } } });
    let created = 0;
    let reused = 0;
    let reparented = 0;

    async function resolveCategory(name: string, parentId: string | null, sortOrder: number) {
      currentCategoryName = name;
      const slug = slugify(name);
      const bySlug = existing.find((category) => category.slug === slug);
      const byName = existing.filter((category) => nameKey(category.name) === nameKey(name));
      if (byName.length > 1) throw new Error(`Multiple existing categories match “${name}”. Resolve the duplicate records before seeding.`);
      if (bySlug && nameKey(bySlug.name) !== nameKey(name)) {
        throw new Error(`Slug “${slug}” is already used by “${bySlug.name}”; no changes were made.`);
      }
      if (bySlug && byName.some((category) => category.id !== bySlug.id)) {
        throw new Error(`Slug and name “${name}” resolve to different existing categories; no changes were made.`);
      }

      const match = bySlug ?? byName[0];
      if (match) {
        if (match.parentId !== parentId) {
          if (match._count.products > 0 || match._count.children > 0) {
            throw new Error(`Existing category “${match.name}” has products or children and a different parent. No records were changed.`);
          }
          if (parentId) {
            const parent = existing.find((category) => category.id === parentId);
            if (!parent?.isActive) throw new Error(`Parent for “${name}” is inactive or unavailable. No records were changed.`);
          }
          const updated = await tx.category.update({ where: { id: match.id }, data: { parentId } });
          const updatedMatch = { ...match, ...updated, _count: match._count };
          existing[existing.findIndex((category) => category.id === match.id)] = updatedMatch;
          reparented += 1;
          reused += 1;
          return updatedMatch;
        }
        reused += 1;
        return match;
      }

      if (parentId) {
        const parent = existing.find((category) => category.id === parentId);
        if (!parent?.isActive) throw new Error(`Parent for “${name}” is inactive or unavailable. No changes were made.`);
      }
      const category = await tx.category.create({ data: { name, slug, parentId, sortOrder, isActive: true }, include: { _count: { select: { products: true, children: true } } } });
      if (!category) throw new Error(`Prisma returned no row when creating “${name}”.`);
      existing.push(category);
      created += 1;
      return category;
    }

    let rootCount = 0;
    let subcategoryCount = 0;
    for (const [rootIndex, rootDefinition] of hierarchy.entries()) {
      const root = await resolveCategory(rootDefinition.name, null, rootIndex + 1);
      if (root.parentId !== null) throw new Error(`Root “${root.name}” is not a root category. No changes were committed.`);
      rootCount += 1;
      for (const [childIndex, childName] of rootDefinition.children.entries()) {
        const child = await resolveCategory(childName, root.id, childIndex + 1);
        if (child.parentId !== root.id) throw new Error(`Subcategory “${child.name}” is linked to the wrong parent. No changes were committed.`);
        subcategoryCount += 1;
      }
    }

    const productAssignmentsAfter = await tx.product.findMany({ select: { id: true, categoryId: true }, orderBy: { id: "asc" } });
    if (JSON.stringify(productAssignmentsBefore) !== JSON.stringify(productAssignmentsAfter)) {
      throw new Error("Product category assignments changed during seeding. The transaction was rolled back.");
    }
    const slugs = existing.map((category) => category.slug);
    if (new Set(slugs).size !== slugs.length) throw new Error("Duplicate slugs exist in the category table. No changes were committed.");
    return { created, reused, reparented, roots: rootCount, subcategories: subcategoryCount, preservedProducts: productAssignmentsAfter.length };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 15000, timeout: 120000 });

  console.log(`Category reconciliation complete: ${stats.roots} requested roots and ${stats.subcategories} requested subcategories.`);
  console.log(`Created ${stats.created}; reused ${stats.reused}; reparented ${stats.reparented}.`);
  console.log(`Verified unique slugs and hierarchy. Preserved ${stats.preservedProducts} existing product-category assignments.`);
}

main()
  .catch((error) => {
    console.error(`Category reconciliation failed near “${currentCategoryName}”:`, error instanceof Error ? error.message : "Unexpected error.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    customDomain?: string;
}

const tenants: Tenant[] = [
    {
        id: "1",
        name: "Vivid Frames",
        slug: "vividframes",
        customDomain: "vividframes.in",
    },
];

export async function getTenant(host: string): Promise<Tenant | null> {

    host = host.toLowerCase();

    // custom domain
    const custom = tenants.find(t => t.customDomain === host);

    if (custom) return custom;

    // subdomain
    if (host.endsWith(".mizhiv.com")) {

        const slug = host.replace(".mizhiv.com", "");

        return tenants.find(t => t.slug === slug) ?? null;
    }

    return null;
}
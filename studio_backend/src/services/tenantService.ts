import TenantRepository, { NewStudio, Studio } from "../repositories/TenantRepository";

export async function getTenant(host: string): Promise<Studio | undefined> {
    host = host.toLowerCase();

    let identifier = host;
    // subdomain
    if (host.endsWith(".mizhiv.com")) {
        identifier = host.replace(".mizhiv.com", "");
    }

    return await TenantRepository.findBySlugOrDomain(identifier);
}

export async function createTenant(data: NewStudio): Promise<Studio> {
    return await TenantRepository.create(data);
}

export async function updateTenant(id: number, data: Partial<NewStudio>): Promise<Studio | undefined> {
    return await TenantRepository.update(id, data);
}
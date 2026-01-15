"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../server";
import type {
  ShadiRestaurant,
  UAEEmirate,
  PriceTier,
  ShadiBadge,
  ThemeCategory,
  DeliveryPlatform,
} from "@/types/restaurant";

export interface CreateRestaurantInput {
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  images: string[];
  cuisine: string[];
  meals: string[];
  emirate: UAEEmirate;
  district: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  priceTier: PriceTier;
  rating: number;
  badges: ShadiBadge[];
  themes: ThemeCategory[];
  features: string[];
  deliveryPlatforms: DeliveryPlatform[];
  phone?: string;
  website?: string;
  instagram?: string;
  averageMealPrice?: number;
}

export async function createRestaurant(
  data: CreateRestaurantInput
): Promise<{ success: boolean; error?: string; restaurant?: ShadiRestaurant }> {
  try {
    const supabase = createClient();

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .insert({
        name: data.name,
        name_ar: data.nameAr,
        description: data.description,
        description_ar: data.descriptionAr,
        images: data.images,
        cuisine: data.cuisine,
        meals: data.meals,
        emirate: data.emirate,
        district: data.district,
        address: data.address,
        coordinates: data.coordinates,
        price_tier: data.priceTier,
        rating: data.rating,
        badges: data.badges,
        themes: data.themes,
        features: data.features,
        delivery_platforms: data.deliveryPlatforms,
        phone: data.phone,
        website: data.website,
        instagram: data.instagram,
        average_meal_price: data.averageMealPrice,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/restaurants");
    revalidatePath("/admin");

    return { success: true, restaurant };
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create restaurant",
    };
  }
}

export async function updateRestaurant(
  id: string,
  data: Partial<CreateRestaurantInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("restaurants")
      .update({
        name: data.name,
        name_ar: data.nameAr,
        description: data.description,
        description_ar: data.descriptionAr,
        images: data.images,
        cuisine: data.cuisine,
        meals: data.meals,
        emirate: data.emirate,
        district: data.district,
        address: data.address,
        coordinates: data.coordinates,
        price_tier: data.priceTier,
        rating: data.rating,
        badges: data.badges,
        themes: data.themes,
        features: data.features,
        delivery_platforms: data.deliveryPlatforms,
        phone: data.phone,
        website: data.website,
        instagram: data.instagram,
        average_meal_price: data.averageMealPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/restaurants");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update restaurant",
    };
  }
}

export async function deleteRestaurant(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("restaurants")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/restaurants");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete restaurant",
    };
  }
}

export async function getRestaurants(): Promise<ShadiRestaurant[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
}

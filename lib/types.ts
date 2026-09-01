export type Space = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  headline: string | null;
  question: string | null;
  brand_color: string | null;
  logo_url: string | null;
  plan: "free" | "pro";
  testimonial_limit: number;
  created_at: string;
};

export type Testimonial = {
  id: string;
  space_id: string;
  type: "text" | "video";
  customer_name: string;
  customer_title: string | null;
  customer_company: string | null;
  customer_email: string | null;
  avatar_url: string | null;
  rating: number | null;
  content_text: string | null;
  media_url: string | null;
  approved: boolean;
  featured: boolean;
  created_at: string;
};

export type Subscription = {
  space_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  price_id: string | null;
  current_period_end: string | null;
  updated_at: string;
};

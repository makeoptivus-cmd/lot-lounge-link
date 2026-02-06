import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, MapPin, Eye, Handshake, Scale, UserCheck,
  Building, FileCheck, Flower2, ArrowRight,
} from "lucide-react";
import Layout from "@/components/Layout";
import { storage } from "@/lib/storage";

const stages = [
  {
    path: "/land-owner",
    label: "Land Owner Details",
    description: "Register owner info, contact & background",
    icon: Users,
    stage: 1,
    color: "from-[hsl(var(--stage-1))] to-[hsl(var(--stage-2))]",
    getCount: () => storage.getLandOwners().length,
  },
  {
    path: "/land-details",
    label: "Land Details",
    description: "FM sketch, site sketch, rates & nature",
    icon: MapPin,
    stage: 2,
    color: "from-[hsl(var(--stage-2))] to-[hsl(var(--stage-1))]",
    getCount: () => storage.getLandDetails().length,
  },
  {
    path: "/site-visit",
    label: "Site Visit",
    description: "Distance, photos & video observations",
    icon: Eye,
    stage: 3,
    color: "from-[hsl(var(--stage-3))] to-[hsl(var(--stage-4))]",
    getCount: () => storage.getSiteVisits().length,
  },
  {
    path: "/owner-meeting",
    label: "Owner Meeting & Price",
    description: "Rate negotiation & final price agreement",
    icon: Handshake,
    stage: 4,
    color: "from-[hsl(var(--stage-4))] to-[hsl(var(--stage-3))]",
    getCount: () => storage.getOwnerMeetings().length,
  },
  {
    path: "/mediation",
    label: "Mediation Details",
    description: "Mediator sessions & outcomes",
    icon: Scale,
    stage: 5,
    color: "from-[hsl(var(--stage-5))] to-[hsl(var(--stage-6))]",
    getCount: () => storage.getMediations().length,
  },
  {
    path: "/buyer-seller",
    label: "Buyer to Seller Meeting",
    description: "Buyer details & meeting notes",
    icon: UserCheck,
    stage: 6,
    color: "from-[hsl(var(--stage-6))] to-[hsl(var(--stage-5))]",
    getCount: () => storage.getBuyerSellerMeetings().length,
  },
  {
    path: "/meeting-place",
    label: "Meeting Place",
    description: "Set venue, date & time",
    icon: Building,
    stage: 7,
    color: "from-[hsl(var(--stage-7))] to-[hsl(var(--stage-6))]",
    getCount: () => storage.getMeetingPlaces().length,
  },
  {
    path: "/advance-registration",
    label: "Advance & Registration",
    description: "Advance payment & registration date",
    icon: FileCheck,
    stage: 8,
    color: "from-[hsl(var(--stage-8))] to-[hsl(var(--stage-1))]",
    getCount: () => storage.getAdvanceRegistrations().length,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Flower2 className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          Success Real Estate
        </h1>
        <p className="mt-2 text-lg font-medium tracking-widest text-accent uppercase">
          💐 Land Seller
        </p>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Complete land selling workflow — from owner registration to buyer advance & registration.
        </p>
      </motion.div>

      {/* Stage Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2"
      >
        {stages.map((s) => {
          const Icon = s.icon;
          const count = s.getCount();
          return (
            <motion.div key={s.stage} variants={item}>
              <Link
                to={s.path}
                className="group relative flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      STAGE {s.stage}
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {count} record{count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                    {s.label}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </Layout>
  );
};

export default Index;

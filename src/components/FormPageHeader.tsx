import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FormPageHeaderProps {
  stage: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function FormPageHeader({ stage, title, description, icon: Icon }: FormPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 sm:mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold font-display sm:h-10 sm:w-10">
          {stage}
        </div>
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
    </motion.div>
  );
}

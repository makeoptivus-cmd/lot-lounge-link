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
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold font-display">
          {stage}
        </div>
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </motion.div>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafetyAlertProps {
  active: boolean;
  onDismiss: () => void;
}

export default function SafetyAlert({ active, onDismiss }: SafetyAlertProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-destructive/95 p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive animate-pulse-slow" />
            </div>

            <h2 className="text-2xl font-bold text-destructive mb-2">
              Safety Alert Active
            </h2>
            <p className="text-muted-foreground mb-6">
              A safety advisory has been issued for this area. All tourism recommendations
              are temporarily suspended for your safety.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-destructive/5 rounded-lg p-3">
                <Phone className="w-5 h-5 text-destructive shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Emergency: 112</p>
                  <p className="text-xs text-muted-foreground">Police / Ambulance / Fire</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-destructive/5 rounded-lg p-3">
                <Shield className="w-5 h-5 text-destructive shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Tourist Helpline: 1363</p>
                  <p className="text-xs text-muted-foreground">24/7 multilingual support</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onDismiss}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Dismiss (Simulation)
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

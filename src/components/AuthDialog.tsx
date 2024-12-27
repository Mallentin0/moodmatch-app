import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');

  const getDescription = () => {
    return view === 'sign_in' 
      ? "Login to save your movie recommendations"
      : "Create an account to save your movie recommendations";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] glass-card">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Welcome to MoodMatch
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        <Auth
          supabaseClient={supabase}
          view={view}
          viewChange={({ view }) => setView(view as 'sign_in' | 'sign_up')}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                  brandButtonText: 'white',
                  defaultButtonBackground: 'hsl(var(--secondary))',
                  defaultButtonBackgroundHover: 'hsl(var(--secondary))',
                  inputBackground: 'hsl(var(--background))',
                  inputBorder: 'hsl(var(--border))',
                  inputBorderHover: 'hsl(var(--primary))',
                  inputBorderFocus: 'hsl(var(--primary))',
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px',
                },
                radii: {
                  borderRadiusButton: '0.5rem',
                  buttonBorderRadius: '0.5rem',
                  inputBorderRadius: '0.5rem',
                },
              },
            },
            style: {
              button: {
                border: '1px solid transparent',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                width: '100%',
              },
              anchor: {
                color: 'hsl(var(--primary))',
                fontWeight: '500',
              },
              message: {
                color: 'hsl(var(--muted-foreground))',
              },
              container: {
                alignItems: 'center',
                width: '100%',
              },
              label: {
                color: 'hsl(var(--foreground))',
                marginBottom: '0.5rem',
              },
              input: {
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                width: '100%',
                minWidth: '300px',
              },
            },
          }}
          theme="dark"
          providers={[]}
          localization={{
            variables: {
              sign_up: {
                password_validation_message: "Password must be at least 6 characters long",
              },
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
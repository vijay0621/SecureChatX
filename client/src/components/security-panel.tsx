import { Shield, Lock, Key, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface SecurityPanelProps {
  contactUsername: string;
  publicKeyFingerprint: string;
  onClose: () => void;
}

export function SecurityPanel({ contactUsername, publicKeyFingerprint, onClose }: SecurityPanelProps) {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Encryption Info</CardTitle>
                <CardDescription>Chat with {contactUsername}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-security">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">End-to-End Encrypted</h3>
                <p className="text-sm text-muted-foreground">
                  Messages are secured with AES-256-GCM encryption. Only you and {contactUsername} can read them.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-1">RSA Key Exchange</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Session keys are exchanged using RSA-2048 encryption
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs font-mono break-all">
                    {publicKeyFingerprint.slice(0, 64)}...
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">Message Integrity</h3>
                <p className="text-sm text-muted-foreground">
                  SHA-256 HMAC ensures messages haven't been tampered with
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Your private keys never leave your device. The server only relays encrypted messages.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import { getSession, setSession } from "@/lib/session";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get("access_token");
      const userId = queryParams.get("userId");
      const encodedDeviceIds = queryParams.get("deviceIds");
  
      // Only execute if access_token and userId are present
      if (!token || !userId) return;
  
      const checkFingerprint = async () => {
        try {
          // Generate device fingerprint
          const fp = await FingerprintJS.load();
          const result = await fp.get();
          const fingerprint = result.visitorId;
  
          // Decode and parse deviceIds from the URL
          let deviceIdArray: string[] = [];
          if (encodedDeviceIds) {
            try {
              deviceIdArray = JSON.parse(decodeURIComponent(encodedDeviceIds));
            } catch (error) {
              console.error("Error parsing deviceIds:", error);
            }
          }
  
          console.log("Generated Fingerprint:", fingerprint);
          console.log("Allowed Device IDs:", deviceIdArray);
  
          // Check if the fingerprint exists in the deviceIdArray
          if (deviceIdArray.includes(fingerprint)) {
            // Fingerprint is registered, proceed with login
            setSession("access_token", token);
            setSession("userId", userId);
  
            setTimeout(() => {
              const accessToken = getSession("access_token");
              if (!accessToken) {
                navigate("/login");
              } else {
                setTimeout(() => {
                  navigate("/dashboard");
                }, 1000);
              }
            }, 100);
          } else {
            // Fingerprint not found, redirect to login with error message
            toast({
              title: "Unauthorized",
              description:
                "Device not registered. Kindly log in to add this device.",
            });
            navigate("/login");
          }
        } catch (error) {
          console.error("Fingerprint generation error:", error);
        }
      };
  
      checkFingerprint();
    }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection onGetStarted={handleGetStarted} />
      <FeatureSection />
      <Footer />
    </div>
  );
};

export default Index;

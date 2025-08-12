import { useAuth } from "@/auth/context/AuthContext";
import { heightOptions } from "@/auth/forms/data/personalDetailsOptions";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Crown, BadgeCheckIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { appwriteConfig, databases, storage } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatHeightCmToFeetInches = (cmValue) => {
  if (!cmValue) return "N/A";
  const heightOption = heightOptions.find((opt) => opt.cmValue === cmValue);
  // Return just the feet and inches part, removing the (cm) part
  return heightOption
    ? heightOption.label.split("(")[0].trim()
    : `${cmValue} cm`;
};

const calculateAge = (dobString) => {
  if (!dobString) return "N/A";
  try {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  } catch (e) {
    console.error("Error calculating age from DOB:", dobString, e);
    return "N/A";
  }
};

// HomePage now accepts a prop for navigating to the profile page
const HomePage = ({ currentUserProfile }) => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate
  const [profiles, setProfiles] = useState([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [error, setError] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const scrollContainerRef = useRef(null);

  // Effect to fetch other profiles based on current user's gender
  useEffect(() => {
    // Only fetch profiles if user is authenticated and auth state is loaded
    if (!user || isLoadingAuth) {
      // * FIX: Removed !currentUserProfile from this condition
      setIsLoadingProfiles(false);
      return;
    }

    const fetchProfiles = async () => {
      setIsLoadingProfiles(true);
      setError(null); // Clear previous errors
      try {
        // Determine the opposite gender for filtering
        // * FIX: Ensure currentUserProfile is available before accessing its gender
        const oppositeGender =
          currentUserProfile?.gender === "Female" ? "Male" : "Female";

        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.profilesCollectionId,
          [
            // Exclude the current user's profile
            Query.notEqual("userId", user.$id),
            // Filter by opposite gender (only if currentUserProfile is available)
            ...(currentUserProfile
              ? [Query.equal("gender", oppositeGender)]
              : []), // * FIX: Conditionally add gender query
            // Order by creation date (newest first)
            Query.orderDesc("$createdAt"),
            // Limit the number of profiles shown (e.g., 20 per page)
            Query.limit(20),
          ]
        );
        setProfiles(response.documents);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError("Failed to load profiles. Please try again later.");
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    // * FIX: Only fetch profiles if currentUserProfile is available,
    // * as gender is needed for the query. This prevents an unnecessary fetch
    // * before the user's profile is fully loaded.
    if (currentUserProfile) {
      fetchProfiles();
    } else {
      setIsLoadingProfiles(false); // If no currentUserProfile, stop loading profiles
    }
  }, [user, isLoadingAuth, currentUserProfile?.gender]); // * FIX: Changed dependency to currentUserProfile?.gender

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < maxScroll - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const timeoutId = setTimeout(checkScroll, 200);

      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);

      return () => {
        clearTimeout(timeoutId);
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [profiles]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = 292 + 20; // Card width + gap
      const containerWidth = container.clientWidth;
      const visibleCards = Math.floor(containerWidth / cardWidth);

      const cardsToScroll = Math.max(1, visibleCards - 1);
      const scrollAmount = cardsToScroll * cardWidth;

      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoadingAuth || !currentUserProfile || isLoadingProfiles) {
    // Check currentUserProfile loading too
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(50vh-100px)] md:pb-12 pb-16">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(50vh-100px)] md:pb-12 pb-16">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(50vh-100px)] md:pb-12 pb-16">
        <p className="text-xl font-semibold">No profiles found.</p>
        <p className="text-sm mt-2">
          Try adjusting your search preferences or check back later!
        </p>
      </div>
    );
  }
  return (
    <div className="md:px-4 lg:px-6 flex md:gap-4  gap-2 justify-center md:justify-start flex-col pl-4">
      <div className="flex gap-1 items-center">
        <h1 className="font-bold md:text-lg flex items-center cursor-pointer text-[16px]">
          Recommendations <ChevronRight size={20} />
        </h1>
      </div>
      <div className="relative group -ml-4 md:ml-0 md:px-0">
        {/* Left Arrow */}
        {showLeftArrow && (
          <div className="absolute left-0 top-[146px] -translate-y-1/2 z-10 bg-opacity-70 hover:bg-opacity-90 text-foreground md:flex items-center justify-center opacity-100 group-hover:opacity-100 transition-all duration-1000 bg-gradient-to-r from-background/60 to-transparent h-[292px] w-[80px] hidden">
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background bg-opacity-70 hover:bg-opacity-90 text-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg border cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <div className="absolute right-0 top-[146px] -translate-y-1/2 z-10 bg-opacity-70 hover:bg-opacity-90 text-foreground md:flex items-center justify-center opacity-100 group-hover:opacity-100 transition-all duration-1000 bg-gradient-to-l from-background/60 to-transparent h-[292px] w-[80px] hidden">
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background bg-opacity-70 hover:bg-opacity-90 text-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg border cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Slider Container */}
        <div
          ref={scrollContainerRef}
          className="flex md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4 md:pr-2 gap-3 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {profiles.map((profile) => {
            const profilePhotoIDs = profile.profilePhotoID || [];
            const profilePhotoURLs = profile.profilePhotoURL || [];
            const firstPhotoId = profilePhotoIDs[0];
            const firstPhotoURL = profilePhotoURLs[0];

            // Determine which image to display based on availability
            // Priority is given to a photo ID from the bucket, then to a URL from the dummy data.
            const primaryPhotoSrc = firstPhotoId
              ? storage.getFileView(appwriteConfig.photoBucket, firstPhotoId)
                  .href
              : firstPhotoURL;

            return (
              <Card
                key={profile.$id}
                // ⭐ Updated Card styling for horizontal scroll
                className="md:max-w-[292px] overflow-hidden md:min-w-[292px] p-0 active:scale-98 transition-all cursor-pointer group/card flex-shrink-0 select-none hover:border-ring max-w-[220px] max-h-[220px] md:max-h-[292px] min-w-[220px] min-h-[220px]"
                onMouseEnter={() => setHoveredCard(profile.$id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(`/profile/${profile.$id}`)}
              >
                <div className="relative">
                  {primaryPhotoSrc ? ( // ⭐ Using primaryPhotoSrc
                    <img
                      src={primaryPhotoSrc}
                      alt={profile.name} // ⭐ Using fullName as per schema
                      // ⭐ Updated image styling
                      className="rounded-t-xl object-cover md:h-73 overflow-hidden w-full h-56"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x300/cccccc/333333?text=No+Pic";
                      }} // Fallback
                    />
                  ) : (
                    // ⭐ Updated placeholder div styling
                    <div className="w-full md:h-73 flex items-center justify-center text-gray-500 text-6xl font-bold rounded-xl bg-gray-200 h-56">
                      {profile.name
                        ? profile.name.charAt(0).toUpperCase()
                        : "?"}{" "}
                      {/* ⭐ Using fullName */}
                    </div>
                  )}
                  {/* Overlay for Name, Age, Height for visual impact */}
                  {/* ⭐ Updated overlay styling */}
                  <div className="absolute w-full bg-gradient-to-t from-black/90 to-transparent p-4 pt-8 bottom-0 flex flex-col items-start">
                    <CardTitle
                      className={
                        "md:text-xl text-white font-medium text-[16px]"
                      }
                    >
                      <span className="flex items-center gap-1">
                        {/* ⭐ Formatting fullName as requested */}
                        <span className="truncate">
                          {" "}
                          {profile.name
                            ?.replace(/[*_]/g, " ")
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ") || "Noname"}
                          ,
                        </span>
                        {calculateAge(profile.dob)}
                        {profile.isIDVerified && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-500 text-white dark:bg-blue-600 md:p-1 rounded-full p-[2.5px]"
                          >
                            <BadgeCheckIcon className="md:scale-130 scale-110" />
                          </Badge>
                        )}
                      </span>
                    </CardTitle>
                    <CardDescription
                      className={
                        "text-muted/80 dark:text-white/70 md:text-sm text-[14px] font-normal"
                      }
                    >
                      {profile.city
                        ? profile.city.charAt(0).toUpperCase() +
                          profile.city.slice(1).toLowerCase()
                        : "N/A"}
                      , {formatHeightCmToFeetInches(profile.height)}
                      {/* {profile.occupation
                  ?.replace(/[*_]/g, " ")
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ") || "N/A"} */}
                    </CardDescription>
                  </div>
                  {/* ⭐ Moved CardHeader inside the relative div and updated its styling */}
                  <CardHeader className={"p-2 absolute top-0"}>
                    {Array.isArray(profile.membershipTier) &&
                      profile.membershipTier.includes("Gold") && (
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger className="cursor-pointer absolute top-2 left-2">
                            <Badge
                              variant="secondary"
                              className="bg-[#EFBF04] text-white dark:bg-[#EFBF04] p-1.5 rounded-full"
                            >
                              <Crown className="scale-120 self-center" />
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side={"right"}>
                            <p>Gold Member</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                  </CardHeader>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <style jsx="true">{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default HomePage;

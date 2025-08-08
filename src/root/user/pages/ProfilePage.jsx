// ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { databases, appwriteConfig, storage, client } from "@/lib/appwrite";
import { useAuth } from "@/auth/context/AuthContext"; // Import useAuth
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lock,
  Loader2,
  UserCircle,
  ChevronLeft,
  Heart,
  Save,
  SaveIcon,
  Bookmark,
  PhoneCall,
  MessageSquareText,
  CircleUser,
  House,
  Phone,
  User,
  Martini,
  UserRoundCog,
  Church,
  CircleUserRound,
  SmilePlus,
  Crown,
  AtSign,
  BadgeCheckIcon,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { heightOptions } from "@/auth/forms/data/personalDetailsOptions";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Import useParams and useNavigate
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChurchPhotosSection from "./ChurchPhotosSection";

// Helper function to format height from cm to feet/inches
const formatHeightCmToFeetInches = (cmValue) => {
  if (!cmValue) return "N/A";
  const heightOption = heightOptions.find((opt) => opt.cmValue === cmValue);
  return heightOption
    ? heightOption.label.split("(")[0].trim()
    : `${cmValue} (${cmValue} cm)`;
};

// Helper function to calculate age from DOB string
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

// Helper for "Last seen" text
const getLastSeenText = (lastActiveTimestamp, createdAtTimestamp) => {
  // If there's no lastActive timestamp, the user has never been active (or not since this feature was implemented).
  // Use the profile creation time as a fallback.
  if (!lastActiveTimestamp) {
    if (!createdAtTimestamp) return "Never";

    const now = new Date();
    const creationTime = new Date(createdAtTimestamp);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // If the user has been active within the last 4 days (matching heartbeat)
    if (diffDays < 5) return "Active recently"; // Changed from "Online"
    if (diffDays < 30) return `Last seen ${diffDays} days ago`;
    if (diffDays < 365)
      return `Last seen ${Math.round(diffDays / 30)} months ago`;
    return `Last seen ${Math.round(diffDays / 365)} years ago`;
  }

  // If there is a lastActive timestamp, use it. This is the "heartbeat" logic.
  const now = new Date();
  if (!lastActiveTimestamp) return "Never";
  const lastActive = new Date(lastActiveTimestamp);
  const diffMs = now.getTime() - lastActive.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // If the user has been active within the last 4 days (matching heartbeat)
  if (diffDays < 5) return "Active recently"; // Changed from "Online"
  if (diffDays < 30) return `Last seen ${diffDays} days ago`;
  if (diffDays < 365)
    return `Last seen ${Math.round(diffDays / 30)} months ago`;
  return `Last seen ${Math.round(diffDays / 365)} years ago`;
};

// ProfilePage now receives currentUserProfile from App.jsx
const ProfilePage = ({ currentUserProfile }) => {
  const { profileId } = useParams(); // Get profileId from URL parameters
  const navigate = useNavigate(); // Initialize useNavigate for going back
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSeenText, setLastSeenText] = useState("");

  // State to manage the dialog's open/close status
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to manage which image the carousel should start on
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);

  // Function to handle opening the modal and setting the initial slide
  const handlePhotoClick = (index) => {
    setInitialSlideIndex(index);
    setIsModalOpen(true);
  };

  // Effect to update the "Last seen" text every minute for a dynamic display
  useEffect(() => {
    // Only run this if a profile is loaded
    if (profile) {
      // Function to update the text
      const updateText = () => {
        // Pass both lastActive and creation date to the helper function
        setLastSeenText(
          getLastSeenText(profile.lastActive, profile.$createdAt)
        );
      };

      // Update immediately
      updateText();

      // Set up a timer to update the text every minute
      const intervalId = setInterval(updateText, 60000); // 0.10 minute

      // Cleanup function to clear the interval
      return () => clearInterval(intervalId);
    }
  }, [profile]); // Re-run if the profile object changes

  // useEffect to fetch the profile data and set up the real-time listener
  useEffect(() => {
    if (!profileId) {
      setError("No profile ID provided in URL.");
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProfile = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.profilesCollectionId,
          profileId
        );
        setProfile(fetchedProfile);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(
          "Failed to load profile. It might not exist or you don't have permission."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    // Set up the real-time listener for the viewed profile
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.profilesCollectionId}.documents.${profileId}`,
      (response) => {
        if (response.payload) {
          // Update the profile state with the new data from the payload
          setProfile(response.payload);
        }
      }
    );

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [profileId]); // Depend on profileId from URL

  const isOnline = getLastSeenText(profile?.lastActive) === "Active recently";

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(50vh-100px)] md:pb-12 pb-16">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(50vh-100px)] md:pb-12 pb-16 gap-2">
        <p className="text-red-500 text-center">{error}</p>
        <Button onClick={() => navigate(-1)} className={"cursor-pointer"}>
          Go Back
        </Button>
        {/* Use navigate(-1) */}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(50vh-100px)] md:pb-12 pb-16 gap-2">
        <p classname="text-center">Profile not found.</p>
        <Button onClick={() => navigate(-1)} className={"cursor-pointer"}>
          Go Back
        </Button>{" "}
        {/* Use navigate(-1) */}
      </div>
    );
  }

  const profilePhotoIDs = profile.profilePhotoID || [];
  const profilePhotoURLs = profile.profilePhotoURL || [];
  const firstPhotoId = profilePhotoIDs[0];
  const firstPhotoURL = profilePhotoURLs[0];

  // Determine which image to display based on availability
  // Priority is given to a photo ID from the bucket, then to a URL from the dummy data.
  const primaryPhotoSrc = firstPhotoId
    ? storage.getFileView(appwriteConfig.photoBucket, firstPhotoId).href
    : firstPhotoURL;

  const photosToDisplay =
    profilePhotoIDs.length > 0 ? profilePhotoIDs : profilePhotoURLs;

  const hasMultiplePhotos = photosToDisplay.length > 1;

  // Function to format enum-like strings (e.g., "never_married" to "Never Married")
  const formatEnum = (str) => {
    if (!str) return "Not Specified";
    return str
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="px-4 lg:px-6 flex flex-col gap-3">
      <Button
        onClick={() => navigate(-1)} // Use navigate(-1) for back
        variant="outline"
        size="icon"
        className="self-start cursor-pointer shadow-sm size-7 w-8 h-8 bg-background rounded-full md:flex items-center border hidden"
      >
        <ChevronLeft size={29} />
      </Button>

      {/* Profile Card Header */}
      <div className="lg:gap-6 flex flex-col gap-2 md:gap-3">
        <div className="flex md:flex-row p-0 lg:gap-6 flex-col gap-2 md:gap-4">
          <Dialog
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            className="bg-none p-0 shadow-none"
          >
            <DialogTrigger
              asChild
              className="cursor-pointer bg-transparent shadow-none"
            >
              {/* This Card serves as the trigger for the dialog */}
              <Card className="lg:max-w-[292px] overflow-hidden lg:min-w-[292px] min-w-[220px] p-0 active:scale-98 transition-all cursor-pointer group/card flex-shrink-0 select-none border-none md:max-w-[220px] relative">
                {primaryPhotoSrc ? (
                  <div
                    className={`w-full aspect-square object-cover max-w-[106px] rounded-full md:max-w-[292px] md:rounded-xl lg:max-w-[292px] lg:rounded-xl flex items-center justify-center border-3 p-[3px] ${isOnline ? "border-emerald-500" : "md:border-transparent"}`}
                  >
                    <img
                      src={primaryPhotoSrc}
                      alt={profile.name}
                      className="w-full aspect-square object-cover max-w-[100px] rounded-full md:max-w-[292px] md:rounded-lg lg:max-w-[292px] lg:shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x300/cccccc/333333?text=No+Pic";
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`aspect-square bg-gray-200 flex items-center justify-center font-extrabold max-w-[100px] rounded-full text-3xl md:max-w-[220px] md:rounded-xl md:text-7xl lg:max-w-[292px]  border-3 lg:rounded-xl lg:text-7xl text-gray-500 shadow-sm ${isOnline ? "border-emerald-500" : "md:border-transparent"}`}
                  >
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                {/* "+X more" badge overlay */}
                {hasMultiplePhotos && (
                  <Badge className="absolute bottom-2 left-16 lg:bottom-3 lg:left-54 bg-black/60 text-white rounded-full p-1 lg:text-xs text-[9px] lg:px-2 md:left-41 md:bottom-3">
                    +{photosToDisplay.length - 1} more
                  </Badge>
                )}
                {Array.isArray(profile.membershipTier) &&
                  profile.membershipTier.includes("Gold") && (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="cursor-pointer absolute top-1 left-1 md:top-3 md:left-3 lg:left-3 lg:top-3">
                        <Badge
                          variant="secondary"
                          className="bg-[#EFBF04] text-white dark:bg-[#EFBF04] md:p-[7px] rounded-full p-1.5"
                        >
                          <Crown className="scale-126 align-middle" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side={"right"}>
                        <p>Gold Member</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
              </Card>
            </DialogTrigger>

            {/* Dialog Content with the Carousel */}
            <DialogContent className="sm:max-w-[550px] bg-transparent border-none shadow-none p-0 text-foreground">
              {photosToDisplay.length > 0 ? (
                <Carousel
                  className="w-full h-full flex items-center justify-center p-0 border-none bg-transparent"
                  opts={{
                    startIndex: initialSlideIndex,
                  }}
                >
                  <CarouselContent>
                    {photosToDisplay.map((photo, index) => {
                      // Determine the source based on whether it's a photo ID or a URL
                      const photoSrc =
                        profilePhotoIDs.length > 0
                          ? storage.getFileView(
                              appwriteConfig.photoBucket,
                              photo
                            ).href
                          : photo;
                      return (
                        <CarouselItem
                          key={index}
                          className="flex items-center justify-center"
                        >
                          <img
                            src={photoSrc}
                            alt={`Profile photo ${index + 1}`}
                            className="object-contain w-full rounded-xl max-h-[90vh]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/400x300/cccccc/333333?text=No+Pic";
                            }}
                          />
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="cursor-pointer" />
                  <CarouselNext className="cursor-pointer" />
                </Carousel>
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center text-gray-500 text-lg rounded-xl bg-gray-800 sm:h-[500px] md:h-[600px]">
                  No Photos To display
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="w-full flex flex-col justify-end md:gap-2">
            <span className="flex items-center gap-1">
              {profile.isIDVerified && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500 text-white dark:bg-blue-600 text-xs flex items-center rounded-full px-[5px] text-center pr-2"
                >
                  <BadgeCheckIcon className="self-center scale-98" />
                  <span className="text-[10px] md:text-[10px] lg:text-[12px]">
                    Verified
                  </span>
                </Badge>
              )}
            </span>
            <Card className="p-0 bg-background w-full min-w-full shadow-none flex border-0">
              <CardDescription className={"p-0 flex flex-col items-start"}>
                <p className="lg:text-3xl font-bold md:text-2xl text-foreground lg:pb-1 text-lg flex items-center">
                  {profile.name}{" "}
                </p>
                <p
                  className={`text-xs md:text-sm ${isOnline ? "text-emerald-500" : ""} flex gap-1`}
                >
                  {profile.lastActive && lastSeenText}
                  {lastSeenText === "Active recently" && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={13} className="size-2.5 md:size-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Active within the last 4 days</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-x-1 text-sm lg:text-[16px] text-foreground">
                  <span className="">{formatEnum(profile.maritalStatus)}</span>
                  <span className="md:text-xl">·</span>
                  <span>{calculateAge(profile.dob)} yrs</span>
                  <span className="md:text-xl">·</span>
                  <span>{formatHeightCmToFeetInches(profile.height)}</span>
                  <span className="md:text-xl">·</span>
                  <span>
                    {formatEnum(
                      profile.religion ? `${profile.religion}` : "Religion: N/A"
                    )}
                    ,{" "}
                    {formatEnum(
                      profile.caste ? `${profile.caste}` : "Caste: N/A"
                    )}
                  </span>
                </div>
                <p className="flex gap-x-1 lg:text-[16px] flex-col lg:flex-row text-foreground pb-1">
                  <span>
                    {formatEnum(profile.highestEducation)},{" "}
                    {formatEnum(profile.occupation)}
                  </span>{" "}
                  <span className="hidden lg:flex">·</span>{" "}
                  <span>
                    {formatEnum(profile.city || "N/A City")},{" "}
                    {formatEnum(profile.state || "N/A State")}, India
                  </span>
                </p>

                {/* About */}
                {(profile.bio ||
                  profile.aboutMe ||
                  profile.highestEducation ||
                  profile.employedIn ||
                  profile.occupation ||
                  profile.city) && (
                  <div className="md:border-0 border-t md:pt-0 pt-1 text-muted-foreground lg:max-w-5xl max-w-sm md:max-w-3xl">
                    <div>
                      <p className="lg:text-[16px]">
                        {profile.bio ||
                          profile.aboutMe ||
                          (() => {
                            const dynamicBio = [];

                            // Education
                            if (profile.highestEducation) {
                              dynamicBio.push(
                                `I have completed my ${formatEnum(profile.highestEducation)}`
                              );
                            }

                            // Employment and Occupation logic
                            const employment = profile.employedIn
                              ? formatEnum(profile.employedIn)
                              : null;
                            const occupation = profile.occupation
                              ? formatEnum(profile.occupation)
                              : null;

                            if (employment) {
                              if (
                                employment.toLowerCase().includes("student")
                              ) {
                                dynamicBio.push(`I am currently a student`);
                              } else if (
                                employment.toLowerCase().includes("not") ||
                                employment.toLowerCase().includes("unemployed")
                              ) {
                                dynamicBio.push(`I am currently not working`);
                              } else {
                                // For employed cases
                                let workString = `I am currently employed`;

                                // Add occupation if it exists and is different from employment status
                                if (
                                  occupation &&
                                  !occupation
                                    .toLowerCase()
                                    .includes("student") &&
                                  !occupation
                                    .toLowerCase()
                                    .includes("unemployed")
                                ) {
                                  workString += ` as a ${occupation}`;
                                }

                                // Add employment type
                                if (
                                  employment
                                    .toLowerCase()
                                    .includes("government")
                                ) {
                                  workString += ` in the government sector`;
                                } else if (
                                  employment.toLowerCase().includes("private")
                                ) {
                                  workString += ` in the private sector`;
                                } else if (
                                  employment
                                    .toLowerCase()
                                    .includes("business") ||
                                  employment.toLowerCase().includes("self")
                                ) {
                                  workString += ` and am self-employed`;
                                } else if (
                                  employment.toLowerCase().includes("defence")
                                ) {
                                  workString += ` in defence/civil services`;
                                }

                                dynamicBio.push(workString);
                              }
                            } else if (occupation) {
                              // If no employment status but occupation exists
                              if (
                                occupation.toLowerCase().includes("student")
                              ) {
                                dynamicBio.push(`I am currently a student`);
                              } else if (
                                !occupation.toLowerCase().includes("unemployed")
                              ) {
                                dynamicBio.push(`I work as a ${occupation}`);
                              }
                            }

                            // Location
                            if (profile.city || profile.state) {
                              const location = [profile.city, profile.state]
                                .filter(Boolean)
                                .join(", ");
                              dynamicBio.push(`I live in ${location}`);
                            }

                            return dynamicBio.length > 0
                              ? dynamicBio.join(". ") + "."
                              : "No information available.";
                          })()}
                      </p>
                    </div>
                  </div>
                )}
              </CardDescription>
            </Card>
          </div>
        </div>
        {/* actions */}
        <div className="flex flex-row md:gap-3 gap-2 items-center lg:gap-4 justify-start border-b pb-4">
          {/* Send Interest */}
          <Button
            className={
              "lg:text-[17px] md:text-[15px] text-sm cursor-pointer lg:max-w-[292px] font-medium md:font-semibold active:scale-98 transition-all md:p-5"
            }
            size={"sm"}
          >
            <Heart className="size-4 md:size-5" strokeWidth={2.5} />
            Send Interest
          </Button>
          {/* Save */}
          <Button
            variant={"outline"}
            size={"sm"}
            className={
              "lg:text-[17px] md:text-[15px] text-sm cursor-pointer lg:max-w-[292px] font-medium md:font-semibold active:scale-98 transition-all border-ring md:p-5 "
            }
          >
            <Bookmark className="size-4 md:size-5" strokeWidth={2.5} />
            Save
          </Button>
          {/* phone */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 md:size-10 border-ring cursor-pointer active:scale-98 transition-all"
              >
                <PhoneCall className="size-4 md:size-5" strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Call</p>
            </TooltipContent>
          </Tooltip>
          {/* message */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 border-ring md:size-10 cursor-pointer active:scale-98 transition-all"
              >
                <MessageSquareText
                  className="size-4 md:size-5"
                  strokeWidth={2.5}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Message</TooltipContent>
          </Tooltip>
          {/* email */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 border-ring md:size-10 cursor-pointer active:scale-98 transition-all"
              >
                <AtSign className="size-4 md:size-5" strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Email</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <CardContent className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 p-0 md:text-[16px]">
        {/* Personal Information */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <CircleUser className="md:size-7 size-6.5" /> */}
            <h3 className="md:text-xl font-medium text-[16px]">
              Personal Information
            </h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              {/* {profile.dob && calculateAge(profile.dob) && (
                <TableRow className={""}>
                  <TableCell className="">Age:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {calculateAge(profile.dob)} Years
                  </TableCell>
                </TableRow>
              )} */}
              {profile.maritalStatus && (
                <TableRow>
                  <TableCell className="">Marital Status:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatEnum(profile.maritalStatus)}
                  </TableCell>
                </TableRow>
              )}
              {profile.height && (
                <TableRow>
                  <TableCell className="">Height:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatHeightCmToFeetInches(profile.height)}
                  </TableCell>
                </TableRow>
              )}
              {/* {profile.weight && (
                <TableRow>
                  <TableCell className="">Weight:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {profile.weight} Kg
                  </TableCell>
                </TableRow>
              )} */}

              <TableRow>
                <TableCell className="">Body Type:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(profile.bodyType)}
                </TableCell>
              </TableRow>

              {profile.motherTongue && (
                <TableRow>
                  <TableCell className="">Mother Tongue:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {profile.motherTongue && profile.motherTongue.length > 0
                      ? profile.motherTongue.map(formatEnum).join(", ")
                      : "Not Specified"}
                  </TableCell>
                </TableRow>
              )}

              <TableRow>
                <TableCell className="align-top">Lives In:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(profile.city) || "N/A"},{" "}
                  {formatEnum(profile.state) || "N/A"}
                </TableCell>
              </TableRow>

              {profile.religion && (
                <TableRow>
                  <TableCell className="">Religion & Caste</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {profile.religion}, {formatEnum(profile.caste)}{" "}
                    {profile.casteNoBar ? "(Caste No Bar)" : ""}
                  </TableCell>
                </TableRow>
              )}

              <TableRow>
                <TableCell className="">Date Of Birth:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {Array.isArray(currentUserProfile.membershipTier) &&
                  currentUserProfile.membershipTier.includes("Gold") ? (
                    profile.dob ? (
                      new Date(profile.dob).toLocaleDateString()
                    ) : (
                      "N/A"
                    )
                  ) : (
                    <span className="text-blue-600 flex items-center gap-1 cursor-pointer">
                      Upgrade to view <Lock className="size-4 inline-block" />
                    </span>
                  )}
                </TableCell>
              </TableRow>

              {profile.employedIn && formatEnum(profile.employedIn) && (
                <TableRow>
                  <TableCell className="">Employment:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatEnum(profile.employedIn)}
                  </TableCell>
                </TableRow>
              )}
              {profile.highestEducation &&
                formatEnum(profile.highestEducation) && (
                  <TableRow>
                    <TableCell className="">Education:</TableCell>
                    <TableCell className="text-foreground font-medium">
                      {formatEnum(profile.highestEducation)}
                    </TableCell>
                  </TableRow>
                )}
              {profile.occupation && formatEnum(profile.occupation) && (
                <TableRow>
                  <TableCell className="">Occupation:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatEnum(profile.occupation)}
                  </TableCell>
                </TableRow>
              )}

              {/* {profile.collegeInstitution && (
                <TableRow>
                  <TableCell className="">Studied at:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {Array.isArray(currentUserProfile.membershipTier) &&
                    currentUserProfile.membershipTier.includes("Gold") ? (
                      profile.collegeInstitution
                    ) : (
                      <span className="text-blue-600 flex items-center gap-1 cursor-pointer">
                        Upgrade to view <Lock className="size-4 inline-block" />
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )} */}

              {profile.organization && (
                <TableRow>
                  <TableCell className="">Works at:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {Array.isArray(currentUserProfile.membershipTier) &&
                    currentUserProfile.membershipTier.includes("Gold") ? (
                      profile.organization
                    ) : (
                      <span className="text-blue-600 flex items-center gap-1 cursor-pointer">
                        Upgrade to view <Lock className="size-4 inline-block" />
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Family Information */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <House className="md:size-7" /> */}
            <h3 className="md:text-xl font-medium text-[16px]">
              Family Information
            </h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              <TableRow>
                <TableCell className="">Family Type:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.familyType !== undefined &&
                  profile.familyType !== null
                    ? `${formatEnum(profile.familyType)} Family`
                    : "Not Specified"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="align-top">Father Occupation:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.fatherOccupation
                    ? `Father is a ${profile.fatherOccupation}`
                    : "Not specified for Father"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="align-top">Mother Occupation:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.motherOccupation
                    ? `Mother is a ${profile.motherOccupation}`
                    : "Not specified for Mother"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Brothers:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.numberOfBrothers !== undefined &&
                  profile.numberOfBrothers !== null &&
                  profile.numberOfBrothers > 0
                    ? `${profile.numberOfBrothers} ${profile.numberOfBrothers === 1 ? "brother" : "brothers"}`
                    : "Not specified"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Sisters:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.numberOfSisters !== undefined &&
                  profile.numberOfSisters !== null &&
                  profile.numberOfSisters > 0
                    ? `${profile.numberOfSisters} ${profile.numberOfSisters === 1 ? "sister" : "sisters"}`
                    : "Not specified"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Location:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.familyLocation !== undefined &&
                  profile.familyLocation !== null
                    ? `${profile.familyLocation}`
                    : "Not Specified"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Contact Information */}
        <div className="border-b pb-4 text-muted-foreground ">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <Phone className="md:size-7 size-6" /> */}
            <h3 className="md:text-xl font-medium text-[16px]">
              Contact Information
            </h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              <TableRow>
                <TableCell className="">Mobile Number:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.membershipTier === "Gold" ? (
                    profile.phone ? (
                      `+91 ${profile.phone}`
                    ) : (
                      "N/A"
                    )
                  ) : (
                    <span className="text-blue-600 flex items-center gap-1 cursor-pointer">
                      Upgrade to view <Lock className="size-4 inline-block" />
                    </span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="">Email:</TableCell>
                <TableCell className="text-foreground font-medium ">
                  {currentUserProfile.membershipTier === "Gold" ? (
                    profile.email ? (
                      `${profile.email}`
                    ) : (
                      "N/A"
                    )
                  ) : (
                    <span className="text-blue-600 flex items-center gap-1 cursor-pointer">
                      Upgrade to view <Lock className="size-4 inline-block" />
                    </span>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Lifestyle */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <SmilePlus className="md:size-8 size-6" /> */}
            <h3 className="md:text-xl font-medium text-[16px]">Lifestyle</h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              <TableRow>
                <TableCell className="">Smoking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {/* Corrected logic using optional chaining to prevent the TypeError */}
                  {profile?.smokingHabits?.length > 0
                    ? profile.smokingHabits.map((habit, index) => (
                        <span key={index}>
                          {formatEnum(habit)}
                          {index < profile.smokingHabits.length - 1 ? ", " : ""}
                        </span>
                      ))
                    : "Not Specified"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Drinking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {/* Corrected logic using optional chaining to prevent the TypeError */}
                  {profile?.drinkingHabits?.length > 0
                    ? profile.drinkingHabits.map((habit, index) => (
                        <span key={index}>
                          {formatEnum(habit)}
                          {index < profile.drinkingHabits.length - 1
                            ? ", "
                            : ""}
                        </span>
                      ))
                    : "Not Specified"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-normal align-top">
                  Interests:
                </TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.hobbiesInterests &&
                  profile.hobbiesInterests.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.hobbiesInterests
                        .filter((hobby) => hobby.trim())
                        .map((hobby, index) => (
                          <Badge
                            key={index}
                            className="rounded-full md:text-[13px] font-normal text-center self-center"
                          >
                            {hobby.trim()}
                          </Badge>
                        ))}
                    </div>
                  ) : (
                    "Not specified"
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Church Details (if applicable) */}
        <div className="border-b md:border-0 pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <Church className="md:size-7" /> */}
            <h3 className="md:text-xl font-medium text-[16px]">
              Church Details
            </h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              {profile.churchName && (
                <TableRow>
                  <TableCell className="">Church Name:</TableCell>
                  <TableCell className="text-foreground font-medium text-wrap">
                    {profile.churchName}
                  </TableCell>
                </TableRow>
              )}
              {profile.churchLocation && (
                <TableRow>
                  <TableCell className="align-top">Church Location:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {profile.churchLocation}
                  </TableCell>
                </TableRow>
              )}
              {profile.pastorName && (
                <TableRow>
                  <TableCell className="">Pastor Name:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {profile.pastorName}
                  </TableCell>
                </TableRow>
              )}

              {/* ⭐ Displaying Church Service Photos */}
              <ChurchPhotosSection profile={profile} />
            </TableBody>
          </Table>
        </div>

        {/* Partner Preferences */}
        <div className="pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <UserRoundCog className="md:size-7" /> */}
            <h3 className="md:text-xl font-medium text-[16px]">
              Partner Preferences
            </h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              <TableRow>
                <TableCell className="">Age Range:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefAgeMin !== undefined &&
                  profile.prefAgeMin !== null &&
                  profile.prefAgeMax !== undefined
                    ? `${profile.prefAgeMin}-${profile.prefAgeMax} yrs`
                    : profile.dob &&
                        calculateAge(profile.dob) !== null &&
                        !isNaN(calculateAge(profile.dob)) // Check if dob exists and age calculation is valid
                      ? `${calculateAge(profile.dob)} yrs or greater`
                      : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Height Range:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefHeightMinCm !== undefined &&
                  profile.prefHeightMinCm !== null &&
                  profile.prefHeightMaxCm !== undefined
                    ? `${formatHeightCmToFeetInches(profile.prefHeightMinCm)} - ${formatHeightCmToFeetInches(profile.prefHeightMaxCm)}`
                    : profile.height && profile.height > 0 // Check if heightCm exists and is a positive number
                      ? `${formatHeightCmToFeetInches(profile.height)} or taller`
                      : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Marital Status:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefMaritalStatus &&
                  profile.prefMaritalStatus.length > 0
                    ? profile.prefMaritalStatus.map(formatEnum).join(", ")
                    : "Never Married"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Mother Tongue:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefMotherTongue &&
                  profile.prefMotherTongue.length > 0
                    ? profile.prefMotherTongue.join(", ")
                    : "Marathi"}
                </TableCell>
              </TableRow>

              {profile.prefComplexion &&
                profile.prefMotherTongue.length > 0 && (
                  <TableRow>
                    <TableCell className="">Complexion:</TableCell>
                    <TableCell className="text-foreground font-medium">
                      {profile.prefComplexion.map(formatEnum).join(", ")}
                    </TableCell>
                  </TableRow>
                )}

              <TableRow>
                <TableCell className="">Physical Status:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefPhysicalStatus &&
                  profile.prefPhysicalStatus.length > 0
                    ? profile.prefPhysicalStatus.map(formatEnum).join(", ")
                    : "Normal"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Smoking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefSmokingHabits &&
                  profile.prefSmokingHabits.length > 0
                    ? profile.prefSmokingHabits.map(formatEnum).join(", ")
                    : "Doesn't Matter"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Drinking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefDrinkingHabits &&
                  profile.prefDrinkingHabits.length > 0
                    ? profile.prefDrinkingHabits.map(formatEnum).join(", ")
                    : "Doesn't Matter"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Religion:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefReligion && profile.prefReligion.length > 0
                    ? profile.prefReligion.join(", ")
                    : profile.religion || "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Caste:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(
                    profile.prefCaste && profile.prefCaste.length > 0
                      ? profile.prefCaste.join(", ")
                      : profile.caste
                        ? `${profile.caste}, No Bar`
                        : "No Bar"
                  )}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Education Level:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefEducationLevel &&
                  profile.prefEducationLevel.length > 0
                    ? profile.prefEducationLevel.map(formatEnum).join(", ")
                    : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Employment Type:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefEmploymentType &&
                  profile.prefEmploymentType.length > 0
                    ? profile.prefEmploymentType.map(formatEnum).join(", ")
                    : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Occupation:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(
                    profile.prefOccupation && profile.prefOccupation.length > 0
                      ? profile.prefOccupation.join(", ")
                      : "Any"
                  )}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Annual Income:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefAnnualIncome &&
                  profile.prefAnnualIncome.length > 0
                    ? profile.prefAnnualIncome.map(formatEnum).join(", ")
                    : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Location:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefState && profile.prefState.length > 0
                    ? profile.prefState.join(", ")
                    : "Any State"}
                  {", "}
                  {profile.prefCity && profile.prefCity.length > 0
                    ? profile.prefCity.join(", ")
                    : " Any City"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </div>
  );
};

export default ProfilePage;

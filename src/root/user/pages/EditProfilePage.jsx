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
  Check,
  PencilIcon,
  SquarePen,
  ChevronRight,
  Info,
  EllipsisVertical,
  Ellipsis,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import ChurchPhotosSection2 from "./ChurchPhotosSection2";
import EditPersonalInfoForm from "./forms/EditPersonalInfoForm";
import { toast } from "sonner";
import EditFamilyInfoForm from "./forms/EditFamilyInfoForm";

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
const getLastSeenText = (timestamp) => {
  if (!timestamp) return "Never";
  const now = new Date();
  const lastActive = new Date(timestamp);
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
const EditProfilePage = ({ currentUserProfile, onProfileUpdate }) => {
  const navigate = useNavigate();

  // State to manage the dialog's open/close status
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to manage which image the carousel should start on
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);
  // ⭐ New state for controlling the Personal Info edit modal
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [isFamilyInfoModalOpen, setIsFamilyInfoModalOpen] = useState(false);

  // Function to format enum-like strings (e.g., "never_married" to "Never Married")
  const formatEnum = (str) => {
    if (!str) return "Not Specified";
    return str
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Function to handle opening the modal and setting the initial slide
  const handlePhotoClick = (index) => {
    setInitialSlideIndex(index);
    setIsModalOpen(true);
  };

  const handleSavePersonalInfoSuccess = (updatedDocument) => {
    setIsPersonalInfoModalOpen(false); // Close the modal
    onProfileUpdate(updatedDocument);
  };

  // Handler for successful save from the family info form
  const handleSaveFamilyInfoSuccess = (updatedDocument) => {
    setIsFamilyInfoModalOpen(false); // Close the modal
    onProfileUpdate(updatedDocument);
  };

  if (!currentUserProfile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(50vh-100px)] md:pb-12 pb-16 gap-2">
        <p className="text-center">Loading profile data...</p>
      </div>
    );
  }

  // Safely get the photo IDs and other related variables here
  const profilePhotoIDs = currentUserProfile?.profilePhotoID || [];
  // * FIX: Get the photo URLs as well from the profile.
  const profilePhotoURLs = currentUserProfile?.profilePhotoURL || [];

  const firstPhotoId = profilePhotoIDs[0];
  const profileName = currentUserProfile?.name || "User";

  // * FIX: Create a single array to use for the carousel and the "more" badge.
  // * This ensures the carousel works with both Appwrite IDs and dummy data URLs.
  const photosToDisplay =
    profilePhotoIDs.length > 0 ? profilePhotoIDs : profilePhotoURLs;
  const hasMultiplePhotos = photosToDisplay.length > 1;

  const isActive =
    getLastSeenText(currentUserProfile?.lastActive) === "Active recently";

  // Determine the primary photo source based on Appwrite ID or a URL fallback.
  const primaryPhotoSrc = firstPhotoId
    ? storage.getFileView(appwriteConfig.photoBucket, firstPhotoId).href
    : profilePhotoURLs[0];

  return (
    <div className="px-4 lg:px-6 flex flex-col gap-2 lg:gap-3">
      <Button
        onClick={() => navigate(-1)} // Use navigate(-1) for back
        variant="outline"
        size="icon"
        className="self-start cursor-pointer shadow-sm size-7 w-8 h-8 bg-background rounded-full md:flex items-center border hidden"
      >
        <ChevronLeft size={29} />
      </Button>

      {/* Profile Card Header */}
      <div className="lg:gap-6 flex flex-col gap-2 md:gap-3 md:mb-2">
        <div className="flex md:flex-row p-0 lg:gap-6 flex-col gap-2 md:gap-4">
          <div className="flex gap-2">
            <Dialog
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              className="bg-transparent shadow-none border-0 p-0"
            >
              <DialogTrigger
                asChild
                className="bg-transparent shadow-none border-0 cursor-pointer"
              >
                <Card
                  className="lg:max-w-[292px] overflow-hidden lg:min-w-[292px] md:min-w-[220px] p-0 active:scale-98 transition-all cursor-pointer group/card flex-shrink-0 select-none md:max-w-[220px] relative max-w-[112px] md:rounded-none"
                  onClick={() => handlePhotoClick(0)}
                >
                  {primaryPhotoSrc ? (
                    <div
                      className={`w-full aspect-square object-cover max-w-[106px] rounded-full md:max-w-[292px] md:rounded-xl lg:max-w-[292px] lg:rounded-xl flex items-center justify-center border-3 p-[3px] ${isActive ? "border-emerald-500" : ""}`}
                    >
                      <img
                        src={primaryPhotoSrc}
                        alt={profileName}
                        className="w-full aspect-square object-cover max-w-[100px] rounded-full md:max-w-[292px] md:rounded-lg lg:max-w-[292px] shadow-sm"
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
                      {profileName ? profileName.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  {hasMultiplePhotos && (
                    <Badge className="absolute bottom-2 left-16 lg:bottom-3 lg:left-54 bg-black/60 text-white rounded-full p-1 lg:text-xs text-[9px] lg:px-2 md:left-41 md:bottom-3">
                      +{photosToDisplay.length - 1} more
                    </Badge>
                  )}
                  {Array.isArray(currentUserProfile.membershipTier) &&
                    currentUserProfile.membershipTier.includes("Gold") && (
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-pointer absolute top-1 left-1 md:top-3 md:left-3 lg:left-3 lg:top-3">
                          <Badge
                            variant="secondary"
                            className="bg-[#EFBF04] text-white dark:bg-[#EFBF04] p-1.5 rounded-full"
                          >
                            <Crown className="scale-130 self-center" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side={"right"}>
                          <p>Gold Member</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                </Card>
              </DialogTrigger>

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
                              className="rounded-xl object-contain w-full max-h-[90vh]"
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
            <Ellipsis className="md:hidden" />
          </div>

          <div className="w-full flex flex-col justify-end md:gap-2">
            <span className="flex items-center gap-[5px]">
              {currentUserProfile.isIDVerified && (
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
                  {currentUserProfile.name}{" "}
                </p>
                <p
                  className={`text-xs md:text-sm ${isActive ? "text-emerald-500" : ""} flex gap-1 items-center`}
                >
                  {currentUserProfile.lastActive &&
                    getLastSeenText(currentUserProfile.lastActive)}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={13} className="size-2.5 md:size-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Active within the last 4 days</p>
                    </TooltipContent>
                  </Tooltip>
                </p>
                <div className="flex flex-wrap items-center gap-x-1 text-sm lg:text-[16px] text-foreground/70">
                  <span>{formatEnum(currentUserProfile.maritalStatus)}</span>
                  <span className="md:text-xl">·</span>
                  <span>{calculateAge(currentUserProfile.dob)} yrs</span>
                  <span className="md:text-xl">·</span>
                  <span>
                    {formatHeightCmToFeetInches(currentUserProfile.height)}
                  </span>
                  <span className="md:text-xl">·</span>
                  <span>
                    {formatEnum(
                      currentUserProfile.religion
                        ? `${currentUserProfile.religion}`
                        : "Caste: N/A"
                    )}
                  </span>
                  <span className="md:text-xl">·</span>
                  <span>
                    {formatEnum(
                      currentUserProfile.caste
                        ? `${currentUserProfile.caste}`
                        : "Caste: N/A"
                    )}
                  </span>
                </div>
                <p className="flex gap-x-1 lg:text-[16px] flex-col lg:flex-row text-foreground/70 pb-1">
                  <span>
                    {formatEnum(currentUserProfile.highestEducation)},{" "}
                    {formatEnum(currentUserProfile.occupation)}
                  </span>
                  <span className="hidden lg:flex">·</span>
                  <span>
                    {formatEnum(currentUserProfile.city || "N/A City")},{" "}
                    {formatEnum(currentUserProfile.state || "N/A State")}, India
                  </span>
                </p>
                {/* About Myself */}
                {(currentUserProfile.bio ||
                  currentUserProfile.aboutMe ||
                  currentUserProfile.highestEducation ||
                  currentUserProfile.employedIn ||
                  currentUserProfile.occupation ||
                  currentUserProfile.city) && (
                  <div className="md:border-0 border-t md:pt-0 pt-1 text-foreground/70 lg:max-w-5xl max-w-sm md:max-w-3xl">
                    {/* {currentUserProfile.name && (
                        <h4 className="font-medium">About you</h4>
                      )} */}
                    <p className="lg:text-[16px]">
                      {currentUserProfile.bio ||
                        (() => {
                          const dynamicBio = [];

                          // Education
                          if (currentUserProfile.highestEducation) {
                            dynamicBio.push(
                              `I have completed my ${formatEnum(currentUserProfile.highestEducation)}`
                            );
                          }

                          // Employment and Occupation logic
                          const employment = currentUserProfile.employedIn
                            ? formatEnum(currentUserProfile.employedIn)
                            : null;
                          const occupation = currentUserProfile.occupation
                            ? formatEnum(currentUserProfile.occupation)
                            : null;

                          if (employment) {
                            if (employment.toLowerCase().includes("student")) {
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
                                !occupation.toLowerCase().includes("student") &&
                                !occupation.toLowerCase().includes("unemployed")
                              ) {
                                workString += ` as a ${occupation}`;
                              }

                              // Add employment type
                              if (
                                employment.toLowerCase().includes("government")
                              ) {
                                workString += ` in the government sector`;
                              } else if (
                                employment.toLowerCase().includes("private")
                              ) {
                                workString += ` in the private sector`;
                              } else if (
                                employment.toLowerCase().includes("business") ||
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
                            if (occupation.toLowerCase().includes("student")) {
                              dynamicBio.push(`I am currently a student`);
                            } else if (
                              !occupation.toLowerCase().includes("unemployed")
                            ) {
                              dynamicBio.push(`I work as a ${occupation}`);
                            }
                          }

                          // Location
                          if (
                            currentUserProfile.city ||
                            currentUserProfile.state
                          ) {
                            const location = [
                              currentUserProfile.city,
                              currentUserProfile.state,
                            ]
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
                )}
              </CardDescription>
            </Card>
          </div>
        </div>
        {/* actions */}
        {/* <div className="flex flex-row md:gap-3 gap-2 items-center lg:gap-4 justify-start border-b pb-4">
          {
            <p className="flex gap-1 items-center">
              +91{currentUserProfile.phone}{" "}
              {(currentUserProfile.mobileVerified && (
                <span className="text-green-600 flex gap-1 items-center">
                  Verified
                  <BadgeCheckIcon size={13} />
                </span>
              )) || (
                <span className="text-red-500 flex gap-1 items-center">
                  Verify
                </span>
              )}
            </p>
          }
          {
            <p className="flex gap-1 items-center">
              {currentUserProfile.email}{" "}
              {(currentUserProfile.emailVerified && (
                <span className="text-green-600 flex gap-1 items-center">
                  Verified
                  <BadgeCheckIcon size={13} />
                </span>
              )) || (
                <span className="text-red-500 flex gap-1 items-center">
                  Verify
                </span>
              )}
            </p>
          }
        </div> */}
      </div>

      <CardContent className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 p-0 md:text-[16px] border-t pt-1 lg:pt-2">
        {/* Personal Information */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground justify-between md:justify-start">
            {/* <CircleUser className="md:size-7 size-6.5" /> */}
            <h3 className="md:text-xl font-medium text-[16px]">
              Personal Information
            </h3>
            <Dialog
              open={isPersonalInfoModalOpen}
              onOpenChange={setIsPersonalInfoModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size={"icon"}
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <SquarePen className="size-5" />
                  <span className="sr-only">Edit Personal Information</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className={"text-foreground"}>
                    Edit Personal Information
                  </DialogTitle>
                  <DialogDescription>
                    Update your personal details here.
                  </DialogDescription>
                </DialogHeader>
                {/* ⭐ NEW: Render the EditPersonalInfoForm here */}
                <EditPersonalInfoForm
                  currentUserProfile={currentUserProfile} // Pass the fetched profile data
                  onSaveSuccess={handleSavePersonalInfoSuccess}
                  onCancel={() => setIsPersonalInfoModalOpen(false)}
                />
                {/* DialogFooter is now handled by the form component's internal buttons */}
              </DialogContent>
            </Dialog>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              {/* <TableRow className={""}>
                <TableCell className="">Age:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {calculateAge(currentUserProfile.dob)} Years
                </TableCell>
              </TableRow>
              <TableRow className={""}>
                <TableCell className="">Name:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.name}
                </TableCell>
              </TableRow> */}

              <TableRow>
                <TableCell className="">Marital Status:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.maritalStatus)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Height:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatHeightCmToFeetInches(currentUserProfile.height)}
                </TableCell>
              </TableRow>

              {/* <TableRow>
                <TableCell className="">Weight:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.weight} Kg
                </TableCell>
              </TableRow> */}

              <TableRow>
                <TableCell className="">Body Type:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.bodyType)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Mother Tongue:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.motherTongue &&
                  currentUserProfile.motherTongue.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {currentUserProfile.motherTongue
                        .filter((lang) => lang.trim())
                        .map((lang, index) => (
                          <p key={index} className="rounded-full font-medium">
                            {formatEnum(lang.trim())}
                          </p>
                        ))}
                    </div>
                  ) : (
                    "Not specified"
                  )}
                </TableCell>
              </TableRow>

              {/* <TableRow>
                <TableCell className="">Lives In:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.city) || "N/A"},{" "}
                  {formatEnum(currentUserProfile.state) || "N/A"}
                </TableCell>
              </TableRow> */}

              {currentUserProfile.religion && currentUserProfile.caste && (
                <TableRow>
                  <TableCell className="">Religion & Caste:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {currentUserProfile.religion},{" "}
                    {formatEnum(currentUserProfile.caste)}{" "}
                    {currentUserProfile.casteNoBar ? "(Caste No Bar)" : ""}
                  </TableCell>
                </TableRow>
              )}

              {/* 
              <TableRow>
                <TableCell className="">Date Of Birth:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.dob
                    ? new Date(currentUserProfile.dob).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow> */}

              {currentUserProfile.employedIn &&
                formatEnum(currentUserProfile.employedIn) && (
                  <TableRow>
                    <TableCell className="">Employment:</TableCell>
                    <TableCell className="text-foreground font-medium">
                      {formatEnum(currentUserProfile.employedIn)}
                    </TableCell>
                  </TableRow>
                )}

              {currentUserProfile.highestEducation &&
                formatEnum(currentUserProfile.highestEducation) && (
                  <TableRow>
                    <TableCell className="">Education:</TableCell>
                    <TableCell className="text-foreground font-medium">
                      {formatEnum(currentUserProfile.highestEducation)}
                    </TableCell>
                  </TableRow>
                )}

              {currentUserProfile.occupation &&
                formatEnum(currentUserProfile.occupation) && (
                  <TableRow>
                    <TableCell className="">Occupation:</TableCell>
                    <TableCell className="text-foreground font-medium">
                      {formatEnum(currentUserProfile.occupation)}
                    </TableCell>
                  </TableRow>
                )}

              {/* <TableRow>
                <TableCell className="">Studied at:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.collegeInstitution)}
                </TableCell>
              </TableRow> */}

              <TableRow>
                <TableCell className="">Works at:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.organization)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Family Information */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground justify-between md:justify-start">
            {/* <House className="md:size-7" /> */}
            <h3 className="md:text-xl font-medium text-[16px]">
              Family Information
            </h3>
            <Dialog
              open={isFamilyInfoModalOpen}
              onOpenChange={setIsFamilyInfoModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size={"icon"}
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <SquarePen className="size-5" />
                  <span className="sr-only">Edit Family Information</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className={"text-foreground"}>
                    Edit Family Information
                  </DialogTitle>
                  <DialogDescription>
                    Update your family details here.
                  </DialogDescription>
                </DialogHeader>
                {/* ⭐ NEW: Render the EditFamilyInfoForm here */}
                <EditFamilyInfoForm
                  currentUserProfile={currentUserProfile} // Pass the fetched profile data
                  onSaveSuccess={handleSaveFamilyInfoSuccess}
                  onCancel={() => setIsFamilyInfoModalOpen(false)}
                />
                {/* DialogFooter is now handled by the form component's internal buttons */}
              </DialogContent>
            </Dialog>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              <TableRow>
                <TableCell className="">Family Type:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.familyType)}{" "}
                  {currentUserProfile.familyType && "Family"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top">Father Occupation:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.fatherOccupation
                    ? `Father is a ${currentUserProfile.fatherOccupation}`
                    : "Not specified for Father"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top">Mother Occupation:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.motherOccupation
                    ? `Mother is a ${currentUserProfile.motherOccupation}`
                    : "Not specified for Mother"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Brothers:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.numberOfBrothers !== undefined &&
                  currentUserProfile.numberOfBrothers !== null &&
                  currentUserProfile.numberOfBrothers > 0
                    ? `${currentUserProfile.numberOfBrothers} ${currentUserProfile.numberOfBrothers === 1 ? "brother" : "brothers"}`
                    : "Not specified"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Sisters:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.numberOfSisters !== undefined &&
                  currentUserProfile.numberOfSisters !== null &&
                  currentUserProfile.numberOfSisters > 0
                    ? `${currentUserProfile.numberOfSisters} ${currentUserProfile.numberOfSisters === 1 ? "sister" : "sisters"}`
                    : "Not specified"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Location:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.familyLocation)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Contact Information */}
        <div className="border-b pb-4 text-muted-foreground">
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
                  {currentUserProfile.phone
                    ? `+91 ${currentUserProfile.phone}`
                    : "N/A"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="">Email:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.email
                    ? `${currentUserProfile.email}`
                    : "N/A"}
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
                  {/* Corrected logic for smoking habits with typo fixed and optional chaining */}
                  {currentUserProfile?.smokingHabits?.length > 0
                    ? currentUserProfile.smokingHabits.map((habit, index) => (
                        <span key={index}>
                          {formatEnum(habit)}
                          {index < currentUserProfile.smokingHabits.length - 1
                            ? ", "
                            : ""}
                        </span>
                      ))
                    : "Not Specified"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Drinking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {/* Corrected logic for drinking habits using optional chaining */}
                  {currentUserProfile?.drinkingHabits?.length > 0
                    ? currentUserProfile.drinkingHabits.map((habit, index) => (
                        <span key={index}>
                          {formatEnum(habit)}
                          {index < currentUserProfile.drinkingHabits.length - 1
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
                  {currentUserProfile.hobbiesInterests &&
                  currentUserProfile.hobbiesInterests.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {currentUserProfile.hobbiesInterests
                        .filter((hobby) => hobby.trim())
                        .map((hobby, index) => (
                          <Badge
                            key={index}
                            className="rounded-full text-[13px] font-normal  text-center self-center"
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
              {currentUserProfile.churchName && (
                <TableRow>
                  <TableCell className="">Church Name:</TableCell>
                  <TableCell className="text-foreground font-medium text-wrap">
                    {currentUserProfile.churchName}
                  </TableCell>
                </TableRow>
              )}
              {currentUserProfile.churchLocation && (
                <TableRow>
                  <TableCell className="align-top">Church Location:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {currentUserProfile.churchLocation}
                  </TableCell>
                </TableRow>
              )}
              {currentUserProfile.pastorName && (
                <TableRow>
                  <TableCell className="">Pastor Name:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {currentUserProfile.pastorName}
                  </TableCell>
                </TableRow>
              )}

              {/* ⭐ Displaying Church Service Photos */}
              <ChurchPhotosSection2 currentUserProfile={currentUserProfile} />
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
                  {currentUserProfile.prefAgeMin !== undefined &&
                  currentUserProfile.prefAgeMin !== null &&
                  currentUserProfile.prefAgeMax !== undefined
                    ? `${currentUserProfile.prefAgeMin}-${currentUserProfile.prefAgeMax} yrs`
                    : currentUserProfile.dob &&
                        calculateAge(currentUserProfile.dob) !== null &&
                        !isNaN(calculateAge(currentUserProfile.dob)) // Check if dob exists and age calculation is valid
                      ? `${calculateAge(currentUserProfile.dob)} yrs or greater`
                      : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Height Range:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefHeightMinCm !== undefined &&
                  currentUserProfile.prefHeightMinCm !== null &&
                  currentUserProfile.prefHeightMaxCm !== undefined
                    ? `${formatHeightCmToFeetInches(currentUserProfile.prefHeightMinCm)} - ${formatHeightCmToFeetInches(currentUserProfile.prefHeightMaxCm)}`
                    : currentUserProfile.height && currentUserProfile.height > 0 // Check if heightCm exists and is a positive number
                      ? `${formatHeightCmToFeetInches(currentUserProfile.height)} or taller`
                      : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Marital Status:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefMaritalStatus &&
                  currentUserProfile.prefMaritalStatus.length > 0
                    ? currentUserProfile.prefMaritalStatus
                        .map(formatEnum)
                        .join(", ")
                    : "Never Married"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Mother Tongue:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefMotherTongue &&
                  currentUserProfile.prefMotherTongue.length > 0
                    ? currentUserProfile.prefMotherTongue.join(", ")
                    : "Marathi"}
                </TableCell>
              </TableRow>

              {currentUserProfile.prefComplexion &&
                currentUserProfile.prefMotherTongue.length > 0 && (
                  <TableRow>
                    <TableCell className="">Complexion:</TableCell>
                    <TableCell className="text-foreground font-medium">
                      {currentUserProfile.prefComplexion
                        .map(formatEnum)
                        .join(", ")}
                    </TableCell>
                  </TableRow>
                )}

              <TableRow>
                <TableCell className="">Physical Status:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefPhysicalStatus &&
                  currentUserProfile.prefPhysicalStatus.length > 0
                    ? currentUserProfile.prefPhysicalStatus
                        .map(formatEnum)
                        .join(", ")
                    : "Normal"}
                </TableCell>
              </TableRow>

              {/* <TableRow>
                <TableCell className="">Eating Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefEatingHabits &&
                  currentUserProfile.prefEatingHabits.length > 0
                    ? currentUserProfile.prefEatingHabits
                        .map(formatEnum)
                        .join(", ")
                    : "Any"}
                </TableCell>
              </TableRow> */}

              <TableRow>
                <TableCell className="">Smoking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefSmokingHabits &&
                  currentUserProfile.prefSmokingHabits.length > 0
                    ? currentUserProfile.prefSmokingHabits
                        .map(formatEnum)
                        .join(", ")
                    : "Doesn't Matter"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Drinking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefDrinkingHabits &&
                  currentUserProfile.prefDrinkingHabits.length > 0
                    ? currentUserProfile.prefDrinkingHabits
                        .map(formatEnum)
                        .join(", ")
                    : "Doesn't Matter"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Religion:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefReligion &&
                  currentUserProfile.prefReligion.length > 0
                    ? currentUserProfile.prefReligion.join(", ")
                    : currentUserProfile.religion || "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Caste:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(
                    currentUserProfile.prefCaste &&
                      currentUserProfile.prefCaste.length > 0
                      ? currentUserProfile.prefCaste.join(", ")
                      : currentUserProfile.caste
                        ? `${currentUserProfile.caste}, No Bar`
                        : "No Bar"
                  )}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Education Level:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefEducationLevel &&
                  currentUserProfile.prefEducationLevel.length > 0
                    ? currentUserProfile.prefEducationLevel
                        .map(formatEnum)
                        .join(", ")
                    : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Employment Type:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefEmploymentType &&
                  currentUserProfile.prefEmploymentType.length > 0
                    ? currentUserProfile.prefEmploymentType
                        .map(formatEnum)
                        .join(", ")
                    : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Occupation:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(
                    currentUserProfile.prefOccupation &&
                      currentUserProfile.prefOccupation.length > 0
                      ? currentUserProfile.prefOccupation.join(", ")
                      : "Any"
                  )}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Annual Income:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefAnnualIncome &&
                  currentUserProfile.prefAnnualIncome.length > 0
                    ? currentUserProfile.prefAnnualIncome
                        .map(formatEnum)
                        .join(", ")
                    : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Location:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefState &&
                  currentUserProfile.prefState.length > 0
                    ? currentUserProfile.prefState.join(", ")
                    : "Any State"}
                  ,
                  {currentUserProfile.prefCity &&
                  currentUserProfile.prefCity.length > 0
                    ? currentUserProfile.prefCity.join(", ")
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

export default EditProfilePage;

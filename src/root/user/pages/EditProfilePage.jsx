import React, { useState, useEffect } from "react";
import { databases, appwriteConfig, storage } from "@/lib/appwrite";
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

  if (diffMinutes < 5) return "Online";
  if (diffMinutes < 60) return `Last seen ${diffMinutes} mins ago`;
  if (diffHours < 24) return `Last seen ${diffHours} hours ago`;
  const day = diffDays > 1 ? "days" : "day";
  return `Last seen ${diffDays} ${day} ago`;
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
    if (!str) return <span className="text-red-500">N/A</span>;
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

  // ⭐ RESTORED THE GUARD CLAUSE to handle the null state and show a loading message
  if (!currentUserProfile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(50vh-100px)] md:pb-12 pb-16 gap-2">
        <p className="text-center">Loading profile data...</p>
      </div>
    );
  }

  // Safely get the photo IDs and other related variables here
  const profilePhotoIDs = currentUserProfile?.profilePhotoID || [];
  const firstPhotoId = profilePhotoIDs[0];
  const hasMultiplePhotos = profilePhotoIDs.length > 1;
  const profileName = currentUserProfile?.name || "User";

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
      <div className="lg:gap-6 flex flex-col gap-2 md:gap-3 md:mb-2">
        <div className="flex md:flex-row p-0 lg:gap-6 flex-col gap-2 md:gap-4">
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
                className="lg:max-w-[292px] overflow-hidden lg:min-w-[292px] min-w-[220px] p-0 active:scale-98 transition-all cursor-pointer group/card flex-shrink-0 select-none border-none md:max-w-[220px] relative"
                onClick={() => handlePhotoClick(0)}
              >
                {firstPhotoId ? (
                  <img
                    src={
                      storage.getFileView(
                        appwriteConfig.photoBucket,
                        firstPhotoId
                      ).href
                    }
                    alt={profileName}
                    className="w-full aspect-square object-cover max-w-[100px] rounded-full md:max-w-[292px] md:rounded-xl lg:max-w-[292px] lg:rounded-xl shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/400x300/cccccc/333333?text=No+Pic";
                    }}
                  />
                ) : (
                  <div className="aspect-square bg-gray-800 flex items-center justify-center font-extrabold max-w-[100px] rounded-full text-3xl md:max-w-[220px] md:rounded-xl md:text-7xl lg:max-w-[292px] lg:rounded-xl lg:text-7xl text-gray-500 shadow-sm">
                    {profileName ? profileName.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                {hasMultiplePhotos && (
                  <Badge className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-black/60 text-white rounded-full px-2 py-1">
                    +{profilePhotoIDs.length - 1} more
                  </Badge>
                )}
              </Card>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[900px] bg-transparent border-none shadow-none p-0 text-foreground">
              {profilePhotoIDs.length > 0 ? (
                <Carousel
                  className="w-full h-full flex items-center justify-center p-0 border-none bg-transparent"
                  opts={{
                    startIndex: initialSlideIndex,
                  }}
                >
                  <CarouselContent className="h-full">
                    {profilePhotoIDs.map((photoId, index) => (
                      <CarouselItem
                        key={index}
                        className="flex items-center justify-center h-full"
                      >
                        <img
                          src={
                            storage.getFileView(
                              appwriteConfig.photoBucket,
                              photoId
                            ).href
                          }
                          alt={`Profile photo ${index + 1}`}
                          className="rounded-xl object-contain w-full max-h-[80vh]"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/400x300/cccccc/333333?text=No+Pic";
                          }}
                        />
                      </CarouselItem>
                    ))}
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
              {currentUserProfile.isIDVerified && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500 text-white dark:bg-blue-600"
                >
                  <BadgeCheckIcon />
                  Verified
                </Badge>
              )}

              {Array.isArray(currentUserProfile.membershipTier) &&
                currentUserProfile.membershipTier.includes("Gold") && (
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger className="cursor-pointer">
                      <Badge
                        variant="secondary"
                        className="bg-[#EFBF04] text-white dark:bg-[#EFBF04]"
                      >
                        <Crown />
                        Premium
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Gold Member</p>
                    </TooltipContent>
                  </Tooltip>
                )}
            </span>
            <Card className="p-0 bg-background w-full min-w-full shadow-none flex border-0">
              <CardDescription className={"p-0 flex flex-col items-start"}>
                <p className="lg:text-6xl font-extrabold md:text-4xl text-foreground md:pb-2 text-2xl flex items-center gap-1">
                  {currentUserProfile.name}{" "}
                </p>
                {/* <p className="text-xs md:text-sm">
                  {currentUserProfile.lastActive
                    ? getLastSeenText(currentUserProfile.lastActive)
                    : "Last seen: N/A"}{" "}
                </p> */}
                <div className="flex flex-wrap items-center gap-x-1 text-sm lg:text-xl">
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
                <p className="flex gap-x-1 lg:text-xl flex-col md:flex-row">
                  <span>
                    {formatEnum(currentUserProfile.highestEducation)},{" "}
                    {formatEnum(currentUserProfile.occupation)}
                  </span>
                  <span className="hidden md:flex">·</span>
                  <span>
                    {formatEnum(currentUserProfile.city || "N/A City")},{" "}
                    {formatEnum(currentUserProfile.state || "N/A State")}, India
                  </span>
                </p>
              </CardDescription>
            </Card>
          </div>
        </div>
        {/* actions */}
        <div className="flex flex-row md:gap-3 gap-2 items-center lg:gap-4 justify-start border-b pb-4">
          {currentUserProfile.mobileVerified && (
            <p className="text-sm flex gap-1 items-center">
              +91{currentUserProfile.phone}{" "}
              <span className="text-green-500 flex gap-1 items-center">
                Verified
                <BadgeCheckIcon size={13} />
              </span>
            </p>
          )}
        </div>
      </div>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-0 md:text-[16px]">
        {/* Personal Information */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <CircleUser className="md:size-7 size-6.5" /> */}
            <h3 className="md:text-2xl font-medium text-xl ">Basic Details</h3>
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
              <TableRow className={""}>
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
              </TableRow>

              <TableRow>
                <TableCell className="">Height:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatHeightCmToFeetInches(currentUserProfile.height)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Weight:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.weight} Kg
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Body Type:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.bodyType)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Spoken Languages:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.motherTongue &&
                  currentUserProfile.motherTongue.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {currentUserProfile.motherTongue
                        .filter((lang) => lang.trim())
                        .map((lang, index) => (
                          <Badge
                            key={index}
                            className="rounded-full text-[13px] font-normal"
                          >
                            {lang.trim()}
                          </Badge>
                        ))}
                    </div>
                  ) : (
                    "Not specified"
                  )}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Marital Status:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.maritalStatus)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Lives In:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.city) || "N/A"},{" "}
                  {formatEnum(currentUserProfile.state) || "N/A"}
                </TableCell>
              </TableRow>

              {currentUserProfile.religion && (
                <TableRow>
                  <TableCell className="">Religion:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {currentUserProfile.religion}
                  </TableCell>
                </TableRow>
              )}

              {currentUserProfile.caste && (
                <TableRow>
                  <TableCell className="">Caste:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatEnum(currentUserProfile.caste)}{" "}
                    {currentUserProfile.casteNoBar ? "(Caste No Bar)" : ""}
                  </TableCell>
                </TableRow>
              )}

              <TableRow>
                <TableCell className="">Date Of Birth:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.dob
                    ? new Date(currentUserProfile.dob).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow>

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

              <TableRow>
                <TableCell className="">Studied at:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(currentUserProfile.collegeInstitution)}
                </TableCell>
              </TableRow>

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
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <House className="md:size-7" /> */}
            <h3 className="md:text-2xl font-medium text-xl">
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
                  <span className="sr-only">Edit Personal Information</span>
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
                {/* ⭐ NEW: Render the EditPersonalInfoForm here */}
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
                <TableCell className="align-top">Parents:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.fatherOccupation
                    ? `Father is a ${currentUserProfile.fatherOccupation}`
                    : "Not specified for Father"}
                  {currentUserProfile.fatherOccupation &&
                    currentUserProfile.motherOccupation &&
                    ", "}
                  <span className="block">
                    {currentUserProfile.motherOccupation
                      ? `Mother is a ${currentUserProfile.motherOccupation}`
                      : "Not specified for Mother"}
                  </span>
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
                  {currentUserProfile.familyLocation !== undefined &&
                  currentUserProfile.familyLocation !== null
                    ? `${currentUserProfile.familyLocation}`
                    : "Not Specified"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Church Details (if applicable) */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <Church className="md:size-7" /> */}
            <h3 className="md:text-2xl font-medium text-xl">Church Details</h3>
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

        {/* Contact Information */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <Phone className="md:size-7 size-6" /> */}
            <h3 className="md:text-2xl font-medium text-xl">
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

        {/* About Myself */}
        {(currentUserProfile.bio ||
          currentUserProfile.aboutMe ||
          currentUserProfile.highestEducation ||
          currentUserProfile.employedIn ||
          currentUserProfile.occupation ||
          currentUserProfile.city) && (
          <div className="border-b pb-4 text-muted-foreground">
            <div className="flex gap-2 items-center pb-2 text-foreground">
              {/* <User className="md:size-8" /> */}
              <h3 className="md:text-2xl font-medium text-xl">About</h3>
            </div>
            <div>
              {currentUserProfile.name && (
                <h4 className="font-medium">About you</h4>
              )}
              <p className="text-foreground">
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
                        if (employment.toLowerCase().includes("government")) {
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
                    if (currentUserProfile.city || currentUserProfile.state) {
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
          </div>
        )}

        {/* Lifestyle */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <SmilePlus className="md:size-8 size-6" /> */}
            <h3 className="md:text-2xl font-medium text-xl">Lifestyle</h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              <TableRow>
                <TableCell className="font-normal align-top">
                  Hobbies:
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
                            className="rounded-full text-[13px] font-normal"
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

              <TableRow>
                <TableCell className="">Smoking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.smokingHabits &&
                  currentUserProfile.smokingHabits
                    ? currentUserProfile.smokingHabits
                    : "Not specified"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Drinking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.drinkingHabits &&
                  currentUserProfile.drinkingHabits
                    ? currentUserProfile.drinkingHabits
                    : "Not specified"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Partner Preferences */}
        <div className="pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <UserRoundCog className="md:size-7" /> */}
            <h3 className="md:text-2xl font-medium text-xl">
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

              <TableRow>
                <TableCell className="">Eating Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefEatingHabits &&
                  currentUserProfile.prefEatingHabits.length > 0
                    ? currentUserProfile.prefEatingHabits
                        .map(formatEnum)
                        .join(", ")
                    : "Any"}
                </TableCell>
              </TableRow>

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
                <TableCell className="">State:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefState &&
                  currentUserProfile.prefState.length > 0
                    ? currentUserProfile.prefState.join(", ")
                    : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">City:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {currentUserProfile.prefCity &&
                  currentUserProfile.prefCity.length > 0
                    ? currentUserProfile.prefCity.join(", ")
                    : "Any"}
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

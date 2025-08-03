// ProfilePage.jsx
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
} from "lucide-react";
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
const ProfilePage = ({ currentUserProfile }) => {
  const { profileId } = useParams(); // Get profileId from URL parameters
  const navigate = useNavigate(); // Initialize useNavigate for going back
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // This is a placeholder component for demonstration.
  // You will replace this with your actual ProfilePage logic
  // This assumes 'profile' is passed as a prop from a parent component.

  // State to manage the dialog's open/close status
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to manage which image the carousel should start on
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);

  // Function to handle opening the modal and setting the initial slide
  const handlePhotoClick = (index) => {
    setInitialSlideIndex(index);
    setIsModalOpen(true);
  };

  // Fetch the specific profile being viewed
  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setError("No profile ID provided in URL.");
        setIsLoading(false);
        return;
      }
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
  }, [profileId]); // Depend on profileId from URL

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

  // Safely get the photo IDs and other related variables here
  const profilePhotoIDs = profile.profilePhotoID || [];
  const firstPhotoId = profilePhotoIDs[0];
  const hasMultiplePhotos = profilePhotoIDs.length > 1;

  // Function to format enum-like strings (e.g., "never_married" to "Never Married")
  const formatEnum = (str) => {
    if (!str) return "N/A";
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
      <div className="lg:gap-6 flex flex-col gap-2 md:gap-3 md:mb-2">
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
              <Card className="lg:max-w-[292px] overflow-hidden lg:min-w-[292px] min-w-[220px] p-0 active:scale-98 transition-all cursor-pointer group/card flex-shrink-0 select-none border-none md:max-w-[220px]">
                {firstPhotoId ? (
                  <img
                    src={
                      storage.getFileView(
                        appwriteConfig.photoBucket,
                        firstPhotoId
                      ).href
                    }
                    alt={profile.name}
                    className="w-full aspect-square object-cover max-w-[100px] rounded-full md:max-w-[292px] md:rounded-xl lg:max-w-[292px] lg:rounded-xl shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/400x300/cccccc/333333?text=No+Pic";
                    }}
                  />
                ) : (
                  <div className="aspect-square bg-gray-800 flex items-center justify-center font-extrabold max-w-[100px] rounded-full text-3xl md:max-w-[220px] md:rounded-xl md:text-7xl lg:max-w-[292px] lg:rounded-xl lg:text-7xl text-gray-500 shadow-sm">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                {/* "+X more" badge overlay */}
                {hasMultiplePhotos && (
                  <Badge className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-black/60 text-white rounded-full px-2 py-1">
                    +{profilePhotoIDs.length - 1} more
                  </Badge>
                )}
              </Card>
            </DialogTrigger>

            {/* Dialog Content with the Carousel */}
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
              {profile.isIDVerified && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500 text-white dark:bg-blue-600"
                >
                  <BadgeCheckIcon />
                  Verified
                </Badge>
              )}

              {Array.isArray(profile.membershipTier) &&
                profile.membershipTier.includes("Gold") && (
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
                  {profile.name}{" "}
                  {/* <span className="font-mono text-sm bg-white/10 px-2 py-1 rounded">
                  {profile.userId}
                </span> */}
                </p>
                <p className="text-xs md:text-sm">
                  {profile.lastActive
                    ? getLastSeenText(profile.lastActive)
                    : "Last seen: N/A"}{" "}
                </p>
                <div className="flex flex-wrap items-center gap-x-1 text-sm lg:text-xl">
                  <span className="">{formatEnum(profile.maritalStatus)}</span>
                  <span className="md:text-xl">·</span>
                  <span>{calculateAge(profile.dob)} yrs</span>
                  <span className="md:text-xl">·</span>
                  <span>{formatHeightCmToFeetInches(profile.height)}</span>
                  <span className="md:text-xl">·</span>
                  <span>
                    {formatEnum(
                      profile.caste ? `${profile.caste}` : "Caste: N/A"
                    )}
                  </span>
                </div>
                <p className="flex gap-x-1 lg:text-xl flex-col md:flex-row">
                  <span>
                    {formatEnum(profile.highestEducation)},{" "}
                    {formatEnum(profile.occupation)}
                  </span>{" "}
                  <span className="hidden md:flex">·</span>{" "}
                  <span>
                    {formatEnum(profile.city || "N/A City")},{" "}
                    {formatEnum(profile.state || "N/A State")}, India
                  </span>
                </p>
              </CardDescription>
            </Card>
          </div>
        </div>
        {/* actions */}
        <div className="flex flex-row md:gap-3 gap-2 items-center lg:gap-4 justify-start border-b pb-4">
          <Button
            className={
              "lg:text-[18px] md:text-[15px] text-sm cursor-pointer lg:max-w-[292px] font-bold active:scale-98 transition-all md:p-5"
            }
            size={"sm"}
          >
            <Heart className="size-4 md:size-5" strokeWidth={2.5} />
            Send Interest
          </Button>
          <Button
            variant={"outline"}
            size={"sm"}
            className={
              "lg:text-[18px] md:text-[15px] text-sm cursor-pointer lg:max-w-[292px] font-bold active:scale-98 transition-all border-ring md:p-5"
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

      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-0 md:text-[16px]">
        {/* Personal Information */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <CircleUser className="md:size-7 size-6.5" /> */}
            <h3 className="md:text-2xl font-medium text-xl ">
              Personal Information
            </h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              {profile.dob && calculateAge(profile.dob) && (
                <TableRow className={""}>
                  <TableCell className="">Age:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {calculateAge(profile.dob)} Years
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
              {profile.weight && (
                <TableRow>
                  <TableCell className="">Weight:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {profile.weight} Kg
                  </TableCell>
                </TableRow>
              )}
              {profile.bodyType && formatEnum(profile.bodyType) && (
                <TableRow>
                  <TableCell className="">Body Type:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatEnum(profile.bodyType)}
                  </TableCell>
                </TableRow>
              )}
              {profile.motherTongue && (
                <TableRow>
                  <TableCell className="">Spoken Languages:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {profile.motherTongue} (Mother Tongue)
                  </TableCell>
                </TableRow>
              )}
              {profile.maritalStatus && (
                <TableRow>
                  <TableCell className="">Marital Status:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatEnum(profile.maritalStatus)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="">Lives In:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {formatEnum(profile.city) || "N/A"},{" "}
                  {formatEnum(profile.state) || "N/A"}
                </TableCell>
              </TableRow>
              {profile.eatingHabits && formatEnum(profile.eatingHabits) && (
                <TableRow>
                  <TableCell className="">Eating Habits:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatEnum(profile.eatingHabits)}
                  </TableCell>
                </TableRow>
              )}
              {profile.religion && (
                <TableRow>
                  <TableCell className="">Religion:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {profile.religion}
                  </TableCell>
                </TableRow>
              )}
              {profile.caste && (
                <TableRow>
                  <TableCell className="">Caste:</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatEnum(profile.caste)}{" "}
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

              {profile.collegeInstitution && (
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
              )}

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
            <h3 className="md:text-2xl font-medium text-xl">
              Family Information
            </h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              <TableRow>
                <TableCell className="align-top">Parents:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.fatherOccupation
                    ? `Father is a ${profile.fatherOccupation}`
                    : "Not specified for Father"}
                  {profile.fatherOccupation && profile.motherOccupation && ", "}
                  <span className="block">
                    {profile.motherOccupation
                      ? `Mother is a ${profile.motherOccupation}`
                      : "Not specified for Mother"}
                  </span>
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

        {/* Church Details (if applicable) */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <Church className="md:size-7" /> */}
            <h3 className="md:text-2xl font-medium text-xl">Church Details</h3>
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
                <TableCell className="text-foreground font-medium">
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

        {/* About Myself */}
        {(profile.bio ||
          profile.aboutMe ||
          profile.highestEducation ||
          profile.employedIn ||
          profile.occupation ||
          profile.city) && (
          <div className="border-b pb-4 text-muted-foreground">
            <div className="flex gap-2 items-center pb-2 text-foreground">
              {/* <User className="md:size-8" /> */}
              <h3 className="md:text-2xl font-medium text-xl">About</h3>
            </div>
            <div>
              {profile.name && (
                <h4 className="font-medium">About {profile.name}</h4>
              )}
              <p className="text-foreground">
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

        {/* Lifestyle */}
        <div className="border-b pb-4 text-muted-foreground">
          <div className="flex gap-2 items-center pb-2 text-foreground">
            {/* <SmilePlus className="md:size-8 size-6" /> */}
            <h3 className="md:text-2xl font-medium text-xl">Lifestyle</h3>
          </div>
          <Table className={"max-w-4xl"}>
            <TableBody className={"md:text-[16px] text-sm"}>
              <TableRow>
                <TableCell className="font-medium align-top">
                  Hobbies:
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
                  {profile.smokingHabits && profile.smokingHabits
                    ? profile.smokingHabits
                    : "Not specified"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">Drinking Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.drinkingHabits && profile.drinkingHabits
                    ? profile.drinkingHabits
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
                <TableCell className="">Eating Habits:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefEatingHabits &&
                  profile.prefEatingHabits.length > 0
                    ? profile.prefEatingHabits.map(formatEnum).join(", ")
                    : "Any"}
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
                <TableCell className="">State:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefState && profile.prefState.length > 0
                    ? profile.prefState.join(", ")
                    : "Any"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="">City:</TableCell>
                <TableCell className="text-foreground font-medium">
                  {profile.prefCity && profile.prefCity.length > 0
                    ? profile.prefCity.join(", ")
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

export default ProfilePage;

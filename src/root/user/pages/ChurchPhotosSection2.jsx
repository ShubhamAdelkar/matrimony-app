import React, { useState, useEffect } from "react";

// Shadcn UI components
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { databases, appwriteConfig, storage } from "@/lib/appwrite";
import { LoaderCircleIcon } from "lucide-react";
// Assuming you have Table, TableBody, TableRow, TableCell from Shadcn UI
// import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
// import { Church } from "lucide-react"; // Example icon, uncomment if used

// Helper component for the stacked images or grid display
const PhotoDisplayGridOrStack = ({ photos, onPhotoClick }) => {
  const isStacked = photos.length > 1; // Decide if we want a stack or a simple grid

  if (isStacked) {
    // Stacked display for multiple photos
    const maxStackedPhotos = 3; // How many photos to show in the stack
    const visiblePhotos = photos.slice(0, maxStackedPhotos);
    const padding = photos.length > maxStackedPhotos;

    return (
      <div
        className={`relative md:w-40 md:h-46 h-40 w-35 cursor-pointer pl-2.5 p-2.5`}
      >
        {visiblePhotos.map((url, index) => (
          <div
            key={url} // Use URL as key, assuming unique
            className={`absolute w-full md:h-40 h-35 rounded-lg overflow-hidden md:shadow-lg shadow-sm transition-all duration-300 ease-in-out backdrop-blur-xl bg-ring border-ring border`}
            style={{
              transform: `rotateZ(${index * 6 - 6}deg) translateY(${index * -2}px)`, // Slight rotation and vertical offset
              zIndex: maxStackedPhotos - index, // Ensure correct stacking order
            }}
            onClick={() => onPhotoClick(index)} // Pass the index of the clicked photo
          >
            <img
              src={url}
              alt={`Church photo ${index + 1}`}
              className="w-full md:h-40 object-cover h-35"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/400x300/cccccc/333333?text=No+Pic";
              }}
            />
          </div>
        ))}
        {photos.length > maxStackedPhotos && (
          <div
            className="absolute bottom-7 right-0 bg-black/60 text-white rounded-full p-1 md:text-xs text-[10px] md:px-2 md:bottom-9 md:right-0 lg:bottom-8 px-2"
            style={{ zIndex: maxStackedPhotos + 1 }}
            onClick={() => onPhotoClick(0)}
          >
            +{photos.length - maxStackedPhotos} more
          </div>
        )}
      </div>
    );
  } else if (photos.length === 1) {
    // Single photo display (no stack needed)
    return (
      <div
        className="relative h-40 rounded-lg overflow-hidden shadow-lg border transition-all duration-300 ease-in-out bg-transparent w-fit border-ring"
        onClick={() => onPhotoClick(0)} // Open carousel from the first (only) photo
      >
        <img
          src={photos[0]}
          alt="Church service photo"
          className="h-40 object-cover transform transition-transform duration-300 hover:scale-105 rounded-lg cursor-pointer"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x300/cccccc/333333?text=No+Pic";
          }}
        />
      </div>
    );
  } else {
    // Photos are not being posted.
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-center border-2 border-dashed rounded-lg p-4">
        Not Available
      </div>
    );
  }
};

// current user profile church photo section
const ChurchPhotosSection2 = ({ currentUserProfile }) => {
  const [churchServicePhotoUrls, setChurchServicePhotoUrls] = useState([]);
  const [isFetchingPhotos, setIsFetchingPhotos] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialSlideIndex, setInitialSlideIndex] = useState(0); // New state for initial carousel slide

  useEffect(() => {
    const loadDisplayPhotos = () => {
      if (
        currentUserProfile?.churchServicePhotos &&
        currentUserProfile.churchServicePhotos.length > 0
      ) {
        setIsFetchingPhotos(true);
        try {
          const urls = currentUserProfile.churchServicePhotos.map((fileId) => {
            const imageUrlObject = storage.getFileView(
              appwriteConfig.photoBucket,
              fileId
            );
            return imageUrlObject ? imageUrlObject.toString() : "";
          });
          setChurchServicePhotoUrls(urls.filter((url) => url !== ""));
          // console.log(
          //   "Generated display photo URLs:",
          //   urls.filter((url) => url !== "")
          // );
        } catch (error) {
          console.error("Error generating display photo URLs:", error);
          setChurchServicePhotoUrls([]);
        } finally {
          setIsFetchingPhotos(false);
        }
      } else {
        setChurchServicePhotoUrls([]);
        setIsFetchingPhotos(false);
      }
    };

    loadDisplayPhotos();
  }, [currentUserProfile.churchServicePhotos]);

  const handlePhotoClick = (index) => {
    setInitialSlideIndex(index); // Set the index of the clicked photo
    setIsModalOpen(true); // Open the modal
  };

  return (
    <>
      {/* Church Details Section (assuming this is part of a larger profile display) */}

      {/* You would have your Table and TableBody here, wrapping the TableRows */}
      {/* Example: */}
      {/* <Table className={"max-w-4xl"}>
          <TableBody className={"md:text-[16px] text-sm"}> */}
      {/* Other TableRows for Church Name, Location, Pastor Name */}
      {/* ... */}

      {/* Church Service Photos Row */}
      <TableRow className={"hover:bg-transparent"}>
        <TableCell className="align-top">Church Service Photos:</TableCell>
        <TableCell className="text-foreground font-medium overflow-y-hidden">
          {isFetchingPhotos ? (
            <div className="flex items-center gap-2 text-blue-500 text-sm">
              <LoaderCircleIcon className="animate-spin size-4" />
              <span>Loading photos...</span>
            </div>
          ) : (
            <PhotoDisplayGridOrStack
              photos={churchServicePhotoUrls}
              onPhotoClick={handlePhotoClick}
            />
          )}
        </TableCell>
      </TableRow>
      {/* </TableBody>
        </Table> */}

      {/* Photo Carousel Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] bg-transparent border-none shadow-none p-0 text-foreground">
          {churchServicePhotoUrls.length > 0 ? (
            <Carousel
              className="w-full h-full flex items-center justify-center p-0 border-none bg-transparent"
              opts={{
                startIndex: initialSlideIndex, // ⭐ Start carousel at the clicked index
              }}
            >
              <CarouselContent>
                {churchServicePhotoUrls.map((url, index) => (
                  <CarouselItem
                    key={index}
                    className="flex items-center justify-center"
                  >
                    <img
                      src={url}
                      alt={`Church service photo ${index + 1}`}
                      className="rounded-xl object-contain w-full max-h-[90vh]"
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
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              No photos to display.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChurchPhotosSection2;

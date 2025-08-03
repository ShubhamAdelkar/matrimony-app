import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function PreferencePage() {
  return (
    <div className="px-4 lg:px-6 flex gap-4 justify-center md:justify-start">
      <Card className="w-full p-0 md:max-w-xs md:min-w-xs max-w-overflow-hidden active:scale-99 transition-all cursor-pointer">
        <div className="relative">
          {true ? (
            <img
              src="https://fra.cloud.appwrite.io/v1/storage/buckets/6874c80200311a05dbec/files/6880c42d000297e80697/view?project=686793e8001856d0f554&mode=admin"
              alt=""
              className="rounded-xl object-cover h-80 overflow-hidden w-full"
            />
          ) : (
            <div className="w-full h-80 flex items-center justify-center text-gray-500 text-6xl font-bold bg-red-300 rounded-xl"></div>
          )}

          <div className="absolute w-full bg-gradient-to-t from-black to-transparent p-4 pt-10 bottom-0 rounded-xl">
            <CardTitle className={"text-2xl text-white"}>
              Mayur Naik, 21
            </CardTitle>
            <CardDescription className={"text-muted dark:text-white/70"}>
              Vengurla | 5'5
            </CardDescription>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* About Me */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
                  About Me
                </h3>
                <p className="text-secondary-foreground leading-relaxed mb-4">
                  {profile.bio || "No bio provided."}
                </p>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">Gender:</span>{" "}
                    {profile.gender || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">Body Type:</span>{" "}
                    {formatEnum(profile.bodyType)}
                  </li>
                  <li>
                    <span className="font-medium">Complexion:</span>{" "}
                    {formatEnum(profile.complexion)}
                  </li>
                  <li>
                    <span className="font-medium">Disability:</span>{" "}
                    {formatEnum(profile.disability)}
                  </li>
                  <li>
                    <span className="font-medium">Eating Habits:</span>{" "}
                    {formatEnum(profile.eatingHabits)}
                  </li>
                  <li>
                    <span className="font-medium">Drinking Habits:</span>{" "}
                    {formatEnum(profile.drinkingHabits)}
                  </li>
                  <li>
                    <span className="font-medium">Hobbies & Interests:</span>{" "}
                    {profile.hobbiesInterests || "Not specified."}
                  </li>
                </ul>
              </div>

              {/* Education & Career */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
                  Education & Career
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">Highest Education:</span>{" "}
                    {formatEnum(profile.highestEducation)}
                  </li>
                  <li>
                    <span className="font-medium">Education Detail:</span>{" "}
                    {profile.educationDetail || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">College/Institution:</span>{" "}
                    {profile.collegeInstitution || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">Employed In:</span>{" "}
                    {formatEnum(profile.employedIn)}
                  </li>
                  <li>
                    <span className="font-medium">Occupation:</span>{" "}
                    {formatEnum(profile.occupation)}
                  </li>
                  <li>
                    <span className="font-medium">Occupation Detail:</span>{" "}
                    {profile.occupationDetail || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">Organization:</span>{" "}
                    {profile.organization || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">Annual Income:</span>{" "}
                    {formatEnum(profile.annualIncome)}
                  </li>
                </ul>
              </div>

              {/* Family Details */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
                  Family Details
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">Family Values:</span>{" "}
                    {profile.familyValues || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">Family Type:</span>{" "}
                    {formatEnum(profile.familyType)}
                  </li>
                  <li>
                    <span className="font-medium">Family Status:</span>{" "}
                    {formatEnum(profile.familyStatus)}
                  </li>
                  <li>
                    <span className="font-medium">Father's Occupation:</span>{" "}
                    {profile.fatherOccupation || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">Mother's Occupation:</span>{" "}
                    {profile.motherOccupation || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">Brothers:</span>{" "}
                    {profile.numberOfBrothers !== undefined
                      ? profile.numberOfBrothers
                      : "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">Sisters:</span>{" "}
                    {profile.numberOfSisters !== undefined
                      ? profile.numberOfSisters
                      : "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">Family Location:</span>{" "}
                    {profile.familyLocation || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">Caste:</span>{" "}
                    {profile.caste || "N/A"}
                  </li>
                </ul>
              </div>

              {/* Location & Contact */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
                  Location & Contact
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">City:</span>{" "}
                    {profile.city || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">District:</span>{" "}
                    {profile.district || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">State:</span>{" "}
                    {profile.state || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">Country:</span>{" "}
                    {profile.country || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium">Email:</span>{" "}
                    {profile.email || "N/A"}
                  </li>
                  {/* Gold Tier Content: DOB and Mobile Number */}
                  <li>
                    <span className="font-medium">Date of Birth:</span>{" "}
                    {isGoldTier ? (
                      profile.dob ? (
                        new Date(profile.dob).toLocaleDateString()
                      ) : (
                        "N/A"
                      )
                    ) : (
                      <span className="text-orange-500 flex items-center gap-1">
                        <Lock className="h-4 w-4 inline-block" /> Upgrade to
                        view
                      </span>
                    )}
                  </li>
                  <li>
                    <span className="font-medium">Mobile No.:</span>{" "}
                    {isGoldTier ? (
                      profile.phone || "N/A"
                    ) : (
                      <span className="text-orange-500 flex items-center gap-1">
                        <Lock className="h-4 w-4 inline-block" /> Upgrade to
                        view
                      </span>
                    )}
                  </li>
                </ul>
              </div>

              {/* Preferred Partner Details */}
              <div className="md:col-span-2">
                <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
                  Preferred Partner Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p>
                      <span className="font-medium">Age Range:</span>{" "}
                      {profile.prefAgeMin !== undefined &&
                      profile.prefAgeMax !== undefined
                        ? `${profile.prefAgeMin}-${profile.prefAgeMax} yrs`
                        : "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Height Range:</span>{" "}
                      {profile.prefHeightMinCm !== undefined &&
                      profile.prefHeightMaxCm !== undefined
                        ? `${formatHeightCmToFeetInches(profile.prefHeightMinCm)} - ${formatHeightCmToFeetInches(profile.prefHeightMaxCm)}`
                        : "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Marital Status:</span>{" "}
                      {profile.prefMaritalStatus?.map(formatEnum).join(", ") ||
                        "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Mother Tongue:</span>{" "}
                      {profile.prefMotherTongue?.join(", ") || "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Complexion:</span>{" "}
                      {profile.prefComplexion?.map(formatEnum).join(", ") ||
                        "Any"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Eating Habits:</span>{" "}
                      {profile.prefEatingHabits?.map(formatEnum).join(", ") ||
                        "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Drinking Habits:</span>{" "}
                      {profile.prefDrinkingHabits?.map(formatEnum).join(", ") ||
                        "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Religion:</span>{" "}
                      {profile.prefReligion?.join(", ") || "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Caste:</span>{" "}
                      {profile.prefCaste?.join(", ") || "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Education Level:</span>{" "}
                      {profile.prefEducationLevel?.map(formatEnum).join(", ") ||
                        "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Employed In:</span>{" "}
                      {profile.prefEmployedIn?.map(formatEnum).join(", ") ||
                        "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Occupation:</span>{" "}
                      {profile.prefOccupation?.map(formatEnum).join(", ") ||
                        "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Annual Income:</span>{" "}
                      {profile.prefAnnualIncome?.map(formatEnum).join(", ") ||
                        "Any"}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {profile.prefState?.join(", ") || "Any"},{" "}
                      {profile.prefCity?.join(", ") || "Any"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Church Details (if applicable) */}

              <div className="md:col-span-2">
                <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
                  Church Details
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">Church Name:</span>{" "}
                    {profile.churchName || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">Church Location:</span>{" "}
                    {profile.churchLocation || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">Pastor Name:</span>{" "}
                    {profile.pastorName || "Not specified."}
                  </li>
                  <li>
                    <span className="font-medium">Church Service Photos:</span>{" "}
                    {profile.churchServicePhotos &&
                    profile.churchServicePhotos.length > 0
                      ? profile.churchServicePhotos.length
                      : "None"}
                  </li>
                </ul>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PreferencePage;

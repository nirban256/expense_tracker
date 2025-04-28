import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    // let loggedInUser = await db.user.findUnique({
    //   where: {
    //     clerkUserId: user.id,
    //   },
    // });

    // If no user found by clerkUserId, try finding by email

    let loggedInUser = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });

    if (loggedInUser) {
      // If found by email, update it with correct clerkUserId
      loggedInUser = await db.user.update({
        where: {
          id: loggedInUser.id,
        },
        data: {
          clerkUserId: user.id,
        },
      });
    }


    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL(`/`, request.url));

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  response.cookies.delete("user");
  //   response.cookies.delete("university");
  //   response.cookies.delete("addressId");

  return response;
}

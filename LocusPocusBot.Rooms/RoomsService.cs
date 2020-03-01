using Newtonsoft.Json.Linq;
using NodaTime;
using NodaTime.Extensions;
using NodaTime.Text;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Linq;

namespace LocusPocusBot.Rooms
{
    public class RoomsService : IRoomsService
    {
        private readonly string easyRoomUrl = "https://logistica.univr.it/PortaleStudentiUnivr/rooms_call.php";
        private readonly HttpClient client;

        public RoomsService(HttpClient client)
        {
            this.client = client;
        }

        public async Task<List<Room>> LoadRooms(Department department)
        {
            // Take the current date for Italy's timezone
            DateTimeZone zone = DateTimeZoneProviders.Tzdb["Europe/Rome"];
            LocalDate now = SystemClock.Instance.InZone(zone).GetCurrentDate();

            // Format date like 13-10-2017
            LocalDatePattern pattern = LocalDatePattern.CreateWithInvariantCulture("dd-MM-yyyy");
            string dateString = pattern.Format(now);

            // Clear cached data of the previous day
            if (department.UpdatedAt != dateString)
            {
                department.Rooms = null;
                department.UpdatedAt = dateString;
            }

            List<List<Room>> nestedRooms = new List<List<Room>>();
            foreach (int id in department.Ids)
            {
                // Prepare the request payload
                var form = new Dictionary<string, string>
                {
                    { "form-type", "rooms" },
                    { "sede", id.ToString() },
                    { "date", dateString },
                    { "_lang", "it" }
                };

                // Post x-www-form-urlencoded data
                HttpResponseMessage response =
                    await this.client.PostAsync(this.easyRoomUrl, new FormUrlEncodedContent(form));

                // Read the response body
                string body = await response.Content.ReadAsStringAsync();

                // Parse the JSON object
                JObject payload = JObject.Parse(body);

                List<Room> rooms = ParseRooms(payload, department, id);
                ParseLectures(payload, rooms);

                nestedRooms.Add(rooms);
            }

            return nestedRooms.SelectMany(x => x).ToList();
        }

        private static List<Room> ParseRooms(JObject payload, Department department, int depId)
        {
            // Get the dictionary of rooms for the department.
            // This API is so weird. You ask information for a department,
            // and it returns all the departments anyway
            JObject roomDic = (JObject)payload.SelectToken($"area_rooms.{depId}");

            // Create a list for rooms
            List<Room> rooms = new List<Room>();

            foreach (KeyValuePair<string, JToken> item in roomDic)
            {
                string roomName = item.Value["room_name"].ToString();

                if (department.Slug == "cavignal")
                {
                    if (roomName.ToLower().StartsWith("sala riunioni"))
                    {
                        continue;
                    }
                    else if (roomName.ToLower().StartsWith("ufficio docenti"))
                    {
                        continue;
                    }
                    else if (roomName.ToLower().StartsWith("sala verde"))
                    {
                        continue;
                    }
                }
                else if (department.Slug == "borgoroma")
                {
                    if (roomName.All(char.IsDigit))
                    {
                        string buildingName = string.Empty;
                        if (depId == 24)
                        {
                            buildingName = "Lente didattica";
                        }
                        else if (depId == 30)
                        {
                            buildingName = "Piastra odontoiatrica";
                        }
                        else if (depId == 27)
                        {
                            buildingName = "Ex area Gavazzi";
                        }

                        if (!string.IsNullOrEmpty(buildingName))
                        {
                            roomName = $"{buildingName} - {roomName}";
                        }
                    }
                }

                Room room = new Room(item.Key, roomName);
                rooms.Add(room);
            }

            return rooms;
        }

        private void ParseLectures(JObject payload, List<Room> rooms)
        {
            JArray eventsArray = (JArray)payload.SelectToken("events");

            // Loop through all the lectures
            // (they could be in random order)
            foreach (JToken item in eventsArray)
            {
                Lecture lec = new Lecture(
                    name: item["name"].ToString(),
                    startTimestamp: item["timestamp_from"].ToObject<long>(),
                    endTimestamp: item["timestamp_to"].ToObject<long>()
                );

                string roomId = item["CodiceAula"].ToString();

                // Assign the parsed lecture to the room
                Room r = rooms.Find(x => x.Key == roomId);

                if (r != null)
                {
                    r.Lectures.Add(lec);
                }
            }
        }
    }
}

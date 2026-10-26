using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Windows.Forms;

[assembly: AssemblyTitle("NOSTRAVECTOR")]
[assembly: AssemblyDescription("NOSTRAVECTOR portable Windows game")]
[assembly: AssemblyProduct("NOSTRAVECTOR")]
[assembly: AssemblyVersion("1.4.0.0")]

internal static class NostraveCtor
{
    const int Port = 17825;
    const string Root = "http://127.0.0.1:17825/";
    const string Identity = "NOSTRAVECTOR-DESKTOP-1";
    static TcpListener listener;
    static volatile bool running = true;
    static int viewers;
    static int seenViewer;
    static long lastViewer = DateTime.UtcNow.Ticks;
    static readonly string token = Guid.NewGuid().ToString("N");
    static readonly Assembly game = Assembly.GetExecutingAssembly();
    static readonly string profile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "NOSTRAVECTOR", "DesktopProfile");

    [STAThread]
    static void Main(string[] args)
    {
        bool serveOnly = Array.IndexOf(args, "--serve-only") >= 0;
        bool testServer = Array.IndexOf(args, "--test-server") >= 0;
        bool ownsMutex;
        using (Mutex mutex = new Mutex(true, @"Local\NOSTRAVECTOR.Desktop.17825", out ownsMutex))
        {
            try
            {
                if (!ownsMutex)
                {
                    if (!serveOnly && !testServer) OpenWindow();
                    return;
                }
                listener = new TcpListener(IPAddress.Loopback, Port);
                try { listener.Start(16); }
                catch (SocketException)
                {
                    throw new InvalidOperationException("NOSTRAVECTOR needs local port 17825. Close the other program using it and launch the game again. The port stays fixed to preserve your desktop saves.");
                }
                Thread server = new Thread(Accept);
                server.IsBackground = true;
                server.Start();
                if (!serveOnly && !testServer) OpenWindow();
                DateTime start = DateTime.UtcNow;
                while (running)
                {
                    Thread.Sleep(500);
                    if (serveOnly) continue;
                    if (Volatile.Read(ref seenViewer) == 0)
                    {
                        if ((DateTime.UtcNow - start).TotalMinutes > 3) break;
                    }
                    else if (Volatile.Read(ref viewers) == 0 && (DateTime.UtcNow - new DateTime(Interlocked.Read(ref lastViewer), DateTimeKind.Utc)).TotalSeconds > 20) break;
                }
            }
            catch (Exception e)
            {
                string folder = Path.GetDirectoryName(profile);
                try { Directory.CreateDirectory(folder); File.WriteAllText(Path.Combine(folder, "launcher-error.txt"), e.ToString()); } catch { }
                if (!serveOnly) MessageBox.Show(e.Message, "NOSTRAVECTOR", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Environment.ExitCode = 1;
            }
            finally
            {
                running = false;
                if (listener != null) listener.Stop();
                if (ownsMutex) mutex.ReleaseMutex();
            }
        }
    }

    static void OpenWindow()
    {
        string[] choices = {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
        };
        string browser = Array.Find(choices, File.Exists);
        if (browser == null) throw new InvalidOperationException("Install Microsoft Edge or Google Chrome to run NOSTRAVECTOR. The game uses its WebGL engine in a dedicated app window.");
        Directory.CreateDirectory(profile);
        Process.Start(new ProcessStartInfo {
            FileName = browser,
            Arguments = "--app=" + Root + "NOSTRAVECTOR_Main_Menu.html --user-data-dir=\"" + profile + "\" --no-first-run --no-default-browser-check --disable-extensions --disable-background-mode --autoplay-policy=no-user-gesture-required --window-size=1440,1000",
            UseShellExecute = false,
            CreateNoWindow = true
        });
    }

    static void Accept()
    {
        while (running)
        {
            try { TcpClient client = listener.AcceptTcpClient(); ThreadPool.QueueUserWorkItem(_ => Serve(client)); }
            catch (SocketException) { if (!running) return; }
            catch (ObjectDisposedException) { return; }
        }
    }

    static void Serve(TcpClient client)
    {
        using (client)
        {
            try
            {
                client.ReceiveTimeout = 5000;
                client.SendTimeout = 15000;
                client.NoDelay = true;
                NetworkStream stream = client.GetStream();
                string request = ReadHeaders(stream);
                string[] first = request.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)[0].Split(' ');
                if (first.Length < 2 || first[0] != "GET") { Reply(stream, "405 Method Not Allowed", "text/plain", "GET required"); return; }
                string path = first[1];
                if (path == "/desktop-status") { Reply(stream, "200 OK", "text/plain", Identity); return; }
                if (path == "/desktop-bridge.js")
                {
                    string script = "(()=>{const hold=async()=>{try{const r=await fetch('/desktop-lifetime/" + token + "',{cache:'no-store'});const reader=r.body.getReader();while(!(await reader.read()).done){}}catch(e){}setTimeout(hold,1000)};hold();})();";
                    Reply(stream, "200 OK", "application/javascript; charset=utf-8", script);
                    return;
                }
                if (path == "/desktop-lifetime/" + token)
                {
                    Interlocked.Increment(ref viewers);
                    Interlocked.Exchange(ref seenViewer, 1);
                    try
                    {
                        Write(stream, "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nCache-Control: no-store\r\nTransfer-Encoding: chunked\r\nConnection: close\r\n\r\n");
                        while (running) { Write(stream, "2\r\nnv\r\n"); stream.Flush(); Thread.Sleep(500); }
                    }
                    finally { Interlocked.Exchange(ref lastViewer, DateTime.UtcNow.Ticks); Interlocked.Decrement(ref viewers); }
                    return;
                }
                if (path == "/" || path == "/NOSTRAVECTOR_Main_Menu.html")
                {
                    using (Stream content = game.GetManifestResourceStream("NOSTRAVECTOR.Game.gz"))
                    {
                        Write(stream, "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Encoding: gzip\r\nCache-Control: no-store\r\nContent-Length: " + content.Length + "\r\nConnection: close\r\n\r\n");
                        content.CopyTo(stream, 262144);
                    }
                    return;
                }
                Reply(stream, "404 Not Found", "text/plain", "Not found");
            }
            catch (Exception) { }
        }
    }

    static string ReadHeaders(Stream stream)
    {
        StringBuilder b = new StringBuilder();
        while (b.Length < 16384)
        {
            int c = stream.ReadByte();
            if (c < 0) throw new IOException("Connection closed");
            b.Append((char)c);
            if (b.Length >= 4 && b[b.Length - 4] == '\r' && b[b.Length - 3] == '\n' && b[b.Length - 2] == '\r' && b[b.Length - 1] == '\n') return b.ToString();
        }
        throw new IOException("Request too large");
    }
    static void Write(Stream stream, string value) { byte[] bytes = Encoding.UTF8.GetBytes(value); stream.Write(bytes, 0, bytes.Length); }
    static void Reply(Stream stream, string status, string mime, string value)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(value);
        Write(stream, "HTTP/1.1 " + status + "\r\nContent-Type: " + mime + "\r\nCache-Control: no-store\r\nContent-Length: " + bytes.Length + "\r\nConnection: close\r\n\r\n");
        stream.Write(bytes, 0, bytes.Length);
    }
}


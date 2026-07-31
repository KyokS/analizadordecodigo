const COLORS = {
    variable: '#ff6b6b',
    function: '#4ecdc4',
    class: '#ffd93d',
    parameter: '#c084fc',
    property: '#60a5fa',
    method: '#34d399',
    constant: '#f97316',
    imported: '#a78bfa',
    template: '#f472b6',
    default: '#94a3b8'
};

const TYPE_LABELS = {
    variable: 'Variable',
    function: 'Función',
    class: 'Clase',
    parameter: 'Parámetro',
    property: 'Propiedad',
    method: 'Método',
    constant: 'Constante',
    imported: 'Import',
    template: 'Template',
    default: 'Otro'
};

let editor;
let graphData = { nodes: [], links: [] };
let currentData = null;
let svg, defs, mainGroup, linkGroup, nodeGroup;
let showLabels = true;
let selectedNode = null;
let chainColors = {};
let chainColorIdx = 0;
const CHAIN_PALETTE = ['#00d9ff','#ff6b6b','#ffd93d','#34d399','#c084fc','#f97316','#60a5fa','#f472b6','#a78bfa','#4ecdc4','#ff9ff3','#1dd1a1','#ee5a24','#0abde3','#10ac84','#8395a7','#ff9f43','#6c5ce7','#e17055','#00cec9'];

const RESERVED = new Set([
    'true','false','null','undefined','this','super','console','window','document','Math',
    'Array','Object','String','Number','Boolean','Promise','Error','RegExp','Map','Set',
    'self','print','len','range','str','int','float','list','dict','set','True','False',
    'None','elif','lambda','yield','async','await','global','nonlocal','pass','raise',
    'try','except','finally','with','as','in','is','not','and','or','del','assert',
    'echo','print_r','var_dump','isset','empty','die','exit','header','session_start',
    'array','count','strlen','substr','strpos','strtolower','strtoupper','trim','explode',
    'implode','json_encode','json_decode','file_get_contents','file_put_contents',
    'curl_init','mysqli_connect','PDO','htmlspecialchars','urlencode','date','time',
    'include','require','include_once','require_once','define','compact','extract',
    'if','else','elseif','while','for','foreach','switch','case','break','continue',
    'return','function','class','interface','trait','extends','implements','new',
    'public','private','protected','static','final','abstract','const','var','let',
    'typeof','instanceof','void','delete','throw','try','catch','finally',
    'fn','match','use','mod','pub','impl','struct','enum','trait','type','where',
    'loop','move','ref','mut','unsafe','async','await','dyn','as','in','crate',
    'println','print','format','eprintln','panic','assert','assert_eq','assert_ne',
    'go','chan','defer','func','import','package','var','const','type','struct',
    'interface','map','make','new','len','cap','append','close','copy','delete',
    'select','case','default','break','continue','fallthrough','goto','return',
    'fmt','os','io','strings','errors','context','time','sync','net','http',
    'puts','gets.chomp','require','gem','load','require_relative','include',
    'extend','prepend','attr_accessor','attr_reader','attr_writer','method_missing',
    'respond_to_missing?','initialize','to_s','to_i','to_f','to_a','to_h',
    'each','map','select','reject','reduce','inject','find','detect','any?','all?',
    'none?','count','size','length','empty?','nil?','is_a?','kind_of?','instance_of?',
    'block_given?','lambda','proc','yield','call','send','__send__',
    'package','import','func','var','const','type','struct','interface',
    'int','int8','int16','int32','int64','uint','uint8','uint16','uint32','uint64',
    'float32','float64','complex64','complex128','bool','byte','rune','string','error',
    'make','new','len','cap','append','copy','close','delete','panic','recover',
    'defer','go','chan','select','case','default','range','map','true','false','iota',
    'nil','println','print','Scan','Scanf','Sprintf','Fprintf','Fscanf',
    'fn','let','mut','pub','mod','use','crate','super','self','match','if','else',
    'loop','while','for','return','break','continue','struct','enum','impl','trait',
    'type','where','async','await','move','ref','unsafe','dyn','as','in',
    'println','print','format','eprintln','panic','assert','assert_eq','assert_ne',
    'String','Vec','Box','Rc','Arc','Option','Result','Some','None','Ok','Err',
    'HashMap','HashSet','BTreeMap','BTreeSet','VecDeque','LinkedList','BinaryHeap',
    'func','var','const','type','struct','interface','package','import',
    'fmt','os','io','strings','errors','context','time','sync','net','http',
    'map','make','new','len','cap','append','close','copy','delete',
    'true','false','nil','iota','break','default','func','interface','select',
    'case','defer','go','map','chan','continue','for','import','return',
    'switch','range','type','package','else','goto','panic','fallthrough',
    'if','defer','switch','for','select','case','default','range','type',
    'struct','interface','map','chan','func','var','const','iota','append',
    'cap','close','copy','delete','len','make','new','panic','print','println',
    'recover','real','imag','complex','complex64','complex128',
    'TRUE','FALSE','NULL','None','True','False',
    'begin','end','rescue','ensure','raise','retry','undef','unless','until',
    'super','sub','my','local','our','state','no','use','require','do',
    'CORE','GLOBAL','UNIVERSAL','main','ARGV','ENV','INC','SIG','STDOUT',
    'STDIN','STDERR','DATA','BEGIN','END','DESTROY','AUTOLOAD',
    'if','elsif','else','unless','for','foreach','while','until','do','next',
    'last','redo','goto','return','sub','my','local','our','state','const',
    'package','namespace','use','require','no','BEGIN','END','UNITCHECK',
    'CHECK','INIT','END',
    'print','say','warn','die','exit','eval','exists','delete','push','pop',
    'shift','unshift','splice','split','join','grep','map','sort','reverse',
    'keys','values','each','defined','length','substr','index','rindex',
    'sprintf','printf','unpack','pack','ord','chr','lc','uc','lcfirst','ucfirst',
    'chomp','chop','chdir','chmod','chown','close','closedir','connect',
    'accept','bind','listen','socket','socketpair','send','recv','select',
    'sysread','syswrite','truncate','unlink','mkdir','rmdir','rename',
    'stat','lstat','link','symlink','readlink','glob','opendir','readdir',
    'telldir','seekdir','rewinddir','fileno','fcntl','ioctl','flock',
    'ftruncate','umask','alarm','sleep','times','wait','waitpid','system',
    'exec','fork','pipe','kill','getpgrp','setpgrp','getppid','getpid',
    'getuid','setuid','getgid','setgid','getlogin','getpwent','getpwnam',
    'getpwuid','getgrent','getgrnam','getgrgid','gethostbyname','getservbyname',
    'getprotobyname','getnetbyname','getsockopt','setsockopt','getpeername',
    'getsockname','gethostbyaddr','getservbyport','getprotoent','setprotoent',
    'endprotoent','getnetent','setnetent','endnetent','getgrent','setgrent',
    'endgrent','setpwent','endpwent','sethostent','endhostent','setservent',
    'endservent','gmtime','localtime','time','times','sleep','alarm','utime',
    'chdir','chroot','dir','dir_handle','file_handle','dbm','dbm_hash',
    'form','integer','text::csv','file::find','file::spec','file::path',
    'net::ping','io::socket::inet','lwp::useragent','xml::libxml',
    'json','moose','mouse','any::method','class::method::modifiers',
    'role','before','after','around','override','augment','with',
    'confess','carp','cluck','croak','warn','die','print','say','warn',
    'die','exit','eval','do','require','use','no','import','unimport',
    'abs','accept','alarm','atan2','bind','binmode','bless','break',
    'caller','chdir','chmod','chomp','chop','chown','chr','chroot',
    'close','closedir','connect','cos','crypt','dbmclose','dbmopen',
    'defined','delete','die','dump','each','endgrent','endhostent',
    'endnetent','endprotoent','endpwent','endservent','eof','eval',
    'exec','exists','exit','exp','fcntl','fileno','flock','fork',
    'format','formline','getc','getgrent','getgrgid','getgrnam',
    'gethostbyaddr','gethostbyname','gethostent','getlogin','getnetbyaddr',
    'getnetbyname','getnetent','getpeername','getpgrp','getppid',
    'getpriority','getprotobyname','getprotobynumber','getprotoent',
    'getpwent','getpwnam','getpwuid','getservbyname','getservbyport',
    'getservent','getsockname','getsockopt','glob','goto','gmtime',
    'grep','hex','import','index','int','ioctl','join','keys',
    'kill','last','lc','lcfirst','length','link','listen','local',
    'localtime','log','lstat','m//','map','mkdir','msgctl','msgget',
    'msgrcv','msgsnd','my','next','no','not','oct','open','opendir',
    'ord','our','pack','package','pipe','pop','pos','print','printf',
    'push','q//','qq//','qr//','quotemeta','qw//','qx//','rand',
    'read','readdir','readline','readlink','recv','redo','ref',
    'rename','require','reset','return','reverse','rewinddir',
    'rindex','rmdir','s//','say','scalar','seek','seekdir','select',
    'semctl','semget','semop','send','setgrent','sethostent',
    'setnetent','setpgrp','setpriority','setprotoent','setpwent',
    'setservent','setsockopt','shift','shmctl','shmget','shmread',
    'shmwrite','shutdown','sin','sleep','socket','socketpair',
    'sort','splice','split','sprintf','sqrt','srand','stat',
    'study','sub','substr','symlink','syscall','sysopen','sysread',
    'sysseek','system','syswrite','tell','telldir','tie','tied',
    'time','times','truncate','uc','ucfirst','umask','undef',
    'unlink','unpack','unshift','untie','use','utime','values',
    'vec','wait','waitpid','wantarray','warn','write','y//',
    'STDIN','STDOUT','STDERR','ARGV','ENV','INC','SIG','DATA',
    '$!','$@','$#','$$','$*','$[','$]','$;','$<','$>','$^E',
    '$|','$,','$.','$:','$^','$_','$~','$`','$\'','$+','$&',
    '$*','$1','$2','$3','$4','$5','$6','$7','$8','$9','$10',
    'true','false','nil','self','super','main',
    'BEGIN','END','__DATA__','__END__','__FILE__','__LINE__','__PACKAGE__',
    'CORE::GLOBAL::','UNIVERSAL::',
    'dbmopen','dbmclose','formline','dump','goto','redo','retry','next',
    'last','dump','sub','my','local','our','state','const','no','use',
    'require','do','BEGIN','END','UNITCHECK','CHECK','INIT',
    'if','elsif','else','unless','for','foreach','while','until','do',
    'given','when','default','continue','break','next','last','redo',
    'return','goto','next','last','redo','exit','die','warn','croak',
    'confess','carp','cluck','die','warn','print','say','print STDERR',
    'printf','sprintf','format','write','say','say STDERR',
    'open','close','read','write','seek','tell','binmode','eof',
    'fileno','fcntl','ioctl','stat','lstat','link','unlink','rename',
    'mkdir','rmdir','chmod','chown','truncate','chdir','chroot',
    'opendir','readdir','closedir','telldir','seekdir','rewinddir','glob',
    'fcntl','flock','pipe','socket','socketpair','connect','bind',
    'listen','accept','send','recv','shutdown','getsockopt','setsockopt',
    'getsockname','getpeername','select','sysread','syswrite','sysseek',
    'syscall','sysopen','srand','rand','srand','time','sleep','alarm',
    'times','wait','waitpid','system','exec','fork','kill','getpgrp',
    'setpgrp','getppid','getpid','getuid','setuid','getgid','setgid',
    'getlogin','getpwent','getpwnam','getpwuid','getgrnam','getgrgid',
    'gethostbyname','gethostbyaddr','getservbyname','getservbyport',
    'getprotobyname','getprotoent','getnetbyname','getnetbyaddr','getnetent',
    'sethostent','endhostent','setprotoent','endprotoent','setservent',
    'endservent','setnetent','endnetent','setpwent','endpwent','setgrent',
    'endgrent','gmtime','localtime','time','times','utime',
    'abs','atan2','cos','exp','hex','int','log','oct','ord','chr',
    'sqrt','sin','cos','tan','asin','acos','atan','sinh','cosh','tanh',
    'length','substr','index','rindex','sprintf','printf','print','say',
    'chomp','chop','chdir','chmod','chown','chr','chroot','close',
    'closedir','connect','cos','crypt','dbmclose','dbmopen','defined',
    'delete','die','dump','each','endgrent','endhostent','endnetent',
    'endprotoent','endpwent','endservent','eof','eval','exec','exists',
    'exit','exp','fcntl','fileno','flock','fork','format','formline',
    'getc','getgrent','getgrgid','getgrnam','gethostbyaddr','gethostbyname',
    'gethostent','getlogin','getnetbyaddr','getnetbyname','getnetent',
    'getpeername','getpgrp','getppid','getpriority','getprotobyname',
    'getprotobynumber','getprotoent','getpwent','getpwnam','getpwuid',
    'getservbyname','getservbyport','getservent','getsockname','getsockopt',
    'glob','goto','gmtime','grep','hex','import','index','int','ioctl',
    'join','keys','kill','last','lc','lcfirst','length','link','listen',
    'local','localtime','log','lstat','m//','map','mkdir','msgctl',
    'msgget','msgrcv','msgsnd','my','next','no','not','oct','open',
    'opendir','ord','our','pack','package','pipe','pop','pos','print',
    'printf','push','q//','qq//','qr//','quotemeta','qw//','qx//',
    'rand','read','readdir','readlink','recv','redo','ref','rename',
    'require','reset','return','reverse','rewinddir','rindex','rmdir',
    's//','say','scalar','seek','seekdir','select','semctl','semget',
    'semop','send','setgrent','sethostent','setnetent','setpgrp',
    'setpriority','setprotoent','setpwent','setservent','setsockopt',
    'shift','shmctl','shmget','shmread','shmwrite','shutdown','sin',
    'sleep','socket','socketpair','sort','splice','split','sprintf',
    'sqrt','srand','stat','study','sub','substr','symlink','syscall',
    'sysopen','sysread','sysseek','system','syswrite','tell','telldir',
    'tie','tied','time','times','truncate','uc','ucfirst','umask',
    'undef','unlink','unpack','unshift','untie','use','utime','values',
    'vec','wait','waitpid','wantarray','warn','write','y//',
    'STDIN','STDOUT','STDERR','ARGV','ENV','INC','SIG','DATA',
    'dbmopen','dbmclose','formline','dump','goto','redo','retry',
    'next','last','sub','my','local','our','state','const','no','use',
    'require','do','BEGIN','END','UNITCHECK','CHECK','INIT',
    'if','elsif','else','unless','for','foreach','while','until','do',
    'given','when','default','continue','break','next','last','redo',
    'return','goto','next','last','redo','exit','die','warn','croak',
    'confess','carp','cluck','print','say','printf','sprintf',
    'open','close','read','write','seek','tell','binmode','eof',
    'fileno','fcntl','ioctl','stat','lstat','link','unlink','rename',
    'mkdir','rmdir','chmod','chown','truncate','chdir','chroot',
    'opendir','readdir','closedir','telldir','seekdir','rewinddir','glob',
    'pipe','socket','socketpair','connect','bind','listen','accept',
    'send','recv','shutdown','getsockopt','setsockopt','getsockname',
    'getpeername','select','sysread','syswrite','sysseek','syscall',
    'sysopen','srand','rand','time','sleep','alarm','times','wait',
    'waitpid','system','exec','fork','kill','getpgrp','setpgrp',
    'getppid','getpid','getuid','setuid','getgid','setgid','getlogin',
    'getpwent','getpwnam','getpwuid','getgrnam','getgrgid','gethostbyname',
    'gethostbyaddr','getservbyname','getservbyport','getprotobyname',
    'getprotoent','getnetbyname','getnetbyaddr','getnetent','sethostent',
    'endhostent','setprotoent','endprotoent','setservent','endservent',
    'setnetent','endnetent','setpwent','endpwent','setgrent','endgrent',
    'gmtime','localtime','time','times','utime',
    'abs','atan2','cos','exp','hex','int','log','oct','ord','chr',
    'sqrt','sin','cos','tan','asin','acos','atan','sinh','cosh','tanh',
    'length','substr','index','rindex','sprintf','printf','print','say',
    'chomp','chop','chdir','chmod','chown','chr','chroot','close',
    'closedir','connect','cos','crypt','dbmclose','dbmopen','defined',
    'delete','die','dump','each','endgrent','endhostent','endnetent',
    'endprotoent','endpwent','endservent','eof','eval','exec','exists',
    'exit','exp','fcntl','fileno','flock','fork','format','formline',
    'getc','getgrent','getgrgid','getgrnam','gethostbyaddr','gethostbyname',
    'gethostent','getlogin','getnetbyaddr','getnetbyname','getnetent',
    'getpeername','getpgrp','getppid','getpriority','getprotobyname',
    'getprotobynumber','getprotoent','getpwent','getpwnam','getpwuid',
    'getservbyname','getservbyport','getservent','getsockname','getsockopt',
    'glob','goto','gmtime','grep','hex','import','index','int','ioctl',
    'join','keys','kill','last','lc','lcfirst','length','link','listen',
    'local','localtime','log','lstat','map','mkdir','msgctl','msgget',
    'msgrcv','msgsnd','my','next','no','not','oct','open','opendir',
    'ord','our','pack','package','pipe','pop','pos','print','printf',
    'push','quotemeta','rand','read','readdir','readlink','recv','redo',
    'ref','rename','require','reset','return','reverse','rewinddir',
    'rindex','rmdir','scalar','seek','seekdir','select','semctl','semget',
    'semop','send','setgrent','sethostent','setnetent','setpgrp',
    'setpriority','setprotoent','setpwent','setservent','setsockopt',
    'shift','shmctl','shmget','shmread','shmwrite','shutdown','sin',
    'sleep','socket','socketpair','sort','splice','split','sprintf',
    'sqrt','srand','stat','study','sub','substr','symlink','syscall',
    'sysopen','sysread','sysseek','system','syswrite','tell','telldir',
    'tie','tied','time','times','truncate','uc','ucfirst','umask',
    'undef','unlink','unpack','unshift','untie','use','utime','values',
    'vec','wait','waitpid','wantarray','warn','write',
    'package','import','func','var','const','type','struct','interface',
    'int','int8','int16','int32','int64','uint','uint8','uint16','uint32','uint64',
    'float32','float64','complex64','complex128','bool','byte','rune','string','error',
    'make','new','len','cap','append','close','copy','delete','panic','recover',
    'defer','go','chan','select','case','default','range','map','true','false','iota',
    'nil','println','print','Scan','Scanf','Sprintf','Fprintf','Fscanf',
    'fmt','os','io','strings','errors','context','time','sync','net','http',
    'func','var','const','type','struct','interface','package','import',
    'int','int8','int16','int32','int64','uint','uint8','uint16','uint32','uint64',
    'float32','float64','complex64','complex128','bool','byte','rune','string','error',
    'make','new','len','cap','append','close','copy','delete','panic','recover',
    'defer','go','chan','select','case','default','range','map','true','false','iota',
    'nil','println','print','Scan','Scanf','Sprintf','Fprintf','Fscanf',
    'fmt','os','io','strings','errors','context','time','sync','net','http',
    'fn','let','mut','pub','mod','use','crate','super','self','match','if','else',
    'loop','while','for','return','break','continue','struct','enum','impl','trait',
    'type','where','async','await','move','ref','unsafe','dyn','as','in',
    'println','print','format','eprintln','panic','assert','assert_eq','assert_ne',
    'String','Vec','Box','Rc','Arc','Option','Result','Some','None','Ok','Err',
    'HashMap','HashSet','BTreeMap','BTreeSet','VecDeque','LinkedList','BinaryHeap',
    'fn','let','mut','pub','mod','use','crate','super','self','match','if','else',
    'loop','while','for','return','break','continue','struct','enum','impl','trait',
    'type','where','async','await','move','ref','unsafe','dyn','as','in',
    'println','print','format','eprintln','panic','assert','assert_eq','assert_ne',
    'String','Vec','Box','Rc','Arc','Option','Result','Some','None','Ok','Err',
    'HashMap','HashSet','BTreeMap','BTreeSet','VecDeque','LinkedList','BinaryHeap',
    'func','var','const','type','struct','interface','package','import',
    'int','int8','int16','int32','int64','uint','uint8','uint16','uint32','uint64',
    'float32','float64','complex64','complex128','bool','byte','rune','string','error',
    'make','new','len','cap','append','close','copy','delete','panic','recover',
    'defer','go','chan','select','case','default','range','map','true','false','iota',
    'nil','println','print','Scan','Scanf','Sprintf','Fprintf','Fscanf',
    'fmt','os','io','strings','errors','context','time','sync','net','http',
    'func','var','const','type','struct','interface','package','import',
    'int','int8','int16','int32','int64','uint','uint8','uint16','uint32','uint64',
    'float32','float64','complex64','complex128','bool','byte','rune','string','error',
    'make','new','len','cap','append','close','copy','delete','panic','recover',
    'defer','go','chan','select','case','default','range','map','true','false','iota',
    'nil','println','print','Scan','Scanf','Sprintf','Fprintf','Fscanf',
    'fmt','os','io','strings','errors','context','time','sync','net','http'
]);

const analyzerRules = {
    javascript: [
        { type: 'class', regex: /\b(class)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(function)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>/g, group: 2 },
        { type: 'function', regex: /\b(const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function/g, group: 2 },
        { type: 'constant', regex: /\b(const)\s+([A-Z_][A-Z0-9_]*)/g, group: 2 },
        { type: 'variable', regex: /\b(const|let|var)\s+(\w+)/g, group: 2 },
        { type: 'parameter', regex: /\bfunction\s+\w+\s*\(([^)]*)\)/g, group: 1, split: true },
        { type: 'parameter', regex: /(?:=>|function)\s*(?:\w+\s*)?\(([^)]*)\)/g, group: 1, split: true },
        { type: 'imported', regex: /\bimport\s+(?:{[^}]+}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g, group: 1, isImport: true },
        { type: 'imported', regex: /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, group: 1, isImport: true },
        { type: 'imported', regex: /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g, group: 1, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*[=;]/g, group: 1, isRef: true },
    ],
    typescript: [
        { type: 'class', regex: /\b(class)\s+(\w+)/g, group: 2 },
        { type: 'class', regex: /\b(interface)\s+(\w+)/g, group: 2 },
        { type: 'class', regex: /\b(type)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(function)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(const|let|var)\s+(\w+)\s*(?::\s*\w+(?:<[^>]+>)?(?:\[\])?)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>/g, group: 2 },
        { type: 'function', regex: /\b(const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function/g, group: 2 },
        { type: 'constant', regex: /\b(const)\s+([A-Z_][A-Z0-9_]*)/g, group: 2 },
        { type: 'variable', regex: /\b(const|let|var)\s+(\w+)/g, group: 2 },
        { type: 'parameter', regex: /\bfunction\s+\w+\s*\(([^)]*)\)/g, group: 1, split: true },
        { type: 'parameter', regex: /(?:=>|function)\s*(?:\w+\s*)?\(([^)]*)\)/g, group: 1, split: true },
        { type: 'imported', regex: /\bimport\s+(?:{[^}]+}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g, group: 1, isImport: true },
        { type: 'imported', regex: /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, group: 1, isImport: true },
        { type: 'imported', regex: /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g, group: 1, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*[=;]/g, group: 1, isRef: true },
    ],
    python: [
        { type: 'class', regex: /\bclass\s+(\w+)/g, group: 1 },
        { type: 'function', regex: /\bdef\s+(\w+)/g, group: 1 },
        { type: 'parameter', regex: /\bdef\s+\w+\s*\(([^)]*)\)/g, group: 1, split: true },
        { type: 'constant', regex: /^([A-Z_][A-Z0-9_]*)\s*=/gm, group: 1 },
        { type: 'variable', regex: /\b(\w+)\s*=/g, group: 1 },
        { type: 'imported', regex: /\bimport\s+(\w+)/g, group: 1, isImport: true },
        { type: 'imported', regex: /\bfrom\s+(\w+)\s+import/g, group: 1, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*[=]/g, group: 1, isRef: true },
    ],
    php: [
        { type: 'class', regex: /\b(class)\s+(\w+)/g, group: 2 },
        { type: 'class', regex: /\b(interface)\s+(\w+)/g, group: 2 },
        { type: 'class', regex: /\b(trait)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\bfunction\s+(\w+)/g, group: 1 },
        { type: 'parameter', regex: /\bfunction\s+\w+\s*\(([^)]*)\)/g, group: 1, split: true },
        { type: 'variable', regex: /\$(\w+)/g, group: 1 },
        { type: 'constant', regex: /\bconst\s+([A-Z_][A-Z0-9_]*)/g, group: 1 },
        { type: 'constant', regex: /\bdefine\s*\(\s*['"]([A-Z_][A-Z0-9_]*)['"]/g, group: 1 },
        { type: 'imported', regex: /\b(include|require|include_once|require_once)\s*[\(['"]([^'")\s]+)/g, group: 2, isImport: true },
        { type: 'method', regex: /->(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'method', regex: /::(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /->(\w+)\s*[=;]/g, group: 1, isRef: true },
        { type: 'property', regex: /\$(\w+)\s*=/g, group: 1 },
    ],
    ruby: [
        { type: 'class', regex: /\bclass\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\bmodule\s+(\w+)/g, group: 1 },
        { type: 'function', regex: /\bdef\s+(\w+)/g, group: 1 },
        { type: 'function', regex: /\bdefine_method\s*\(\s*:(\w+)/g, group: 1 },
        { type: 'constant', regex: /\b([A-Z][A-Z0-9_]*)\s*=/g, group: 1 },
        { type: 'variable', regex: /\b(\w+)\s*=/g, group: 1 },
        { type: 'variable', regex: /@(\w+)/g, group: 1 },
        { type: 'variable', regex: /@@(\w+)/g, group: 1 },
        { type: 'parameter', regex: /\bdef\s+\w+\s*\(([^)]*)\)/g, group: 1, split: true },
        { type: 'parameter', regex: /\bdef\s+\w+\s*(?:\|([^)]*)\|)/g, group: 1, split: true },
        { type: 'imported', regex: /\brequire\s*['"]([^'"]+)['"]/g, group: 1, isImport: true },
        { type: 'imported', regex: /\brequire_relative\s*['"]([^'"]+)['"]/g, group: 1, isImport: true },
        { type: 'imported', regex: /\bload\s*['"]([^'"]+)['"]/g, group: 1, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*[\(\s]/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*=/g, group: 1, isRef: true },
    ],
    go: [
        { type: 'function', regex: /\bfunc\s+(\w+)/g, group: 1 },
        { type: 'function', regex: /\bfunc\s*\(([^)]*)\)\s*(\w+)/g, group: 2 },
        { type: 'class', regex: /\btype\s+(\w+)\s+struct/g, group: 1 },
        { type: 'class', regex: /\btype\s+(\w+)\s+interface/g, group: 1 },
        { type: 'variable', regex: /\bvar\s+(\w+)/g, group: 1 },
        { type: 'variable', regex: /\b(\w+)\s*:=/g, group: 1 },
        { type: 'constant', regex: /\bconst\s+([A-Z_][A-Z0-9_]*)/g, group: 1 },
        { type: 'parameter', regex: /\bfunc\s+\w+\s*\(([^)]*)\)/g, group: 1, split: true },
        { type: 'imported', regex: /\bimport\s*"([^"]+)"/g, group: 1, isImport: true },
        { type: 'imported', regex: /\bimport\s*\(\s*([^)]+)\s*\)/g, group: 1, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*[:=]/g, group: 1, isRef: true },
    ],
    rust: [
        { type: 'function', regex: /\bfn\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\bstruct\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\benum\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\btrait\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\btype\s+(\w+)/g, group: 1 },
        { type: 'variable', regex: /\blet\s+(?:mut\s+)?(\w+)/g, group: 1 },
        { type: 'constant', regex: /\bconst\s+([A-Z_][A-Z0-9_]*)/g, group: 1 },
        { type: 'constant', regex: /\bstatic\s+([A-Z_][A-Z0-9_]*)/g, group: 1 },
        { type: 'parameter', regex: /\bfn\s+\w+\s*\(([^)]*)\)/g, group: 1, split: true },
        { type: 'imported', regex: /\buse\s+([\w:]+)/g, group: 1, isImport: true },
        { type: 'imported', regex: /\bextern\s+crate\s+(\w+)/g, group: 1, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'method', regex: /::(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*[=:]/g, group: 1, isRef: true },
    ],
    swift: [
        { type: 'function', regex: /\bfunc\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\bclass\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\bstruct\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\benum\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\bprotocol\s+(\w+)/g, group: 1 },
        { type: 'variable', regex: /\b(var|let)\s+(\w+)/g, group: 2 },
        { type: 'constant', regex: /\bstatic\s+let\s+([A-Z_][A-Z0-9_]*)/g, group: 1 },
        { type: 'parameter', regex: /\bfunc\s+\w+\s*\(([^)]*)\)/g, group: 1, split: true },
        { type: 'imported', regex: /\bimport\s+(\w+)/g, group: 1, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*[=;]/g, group: 1, isRef: true },
    ],
    kotlin: [
        { type: 'function', regex: /\bfun\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\bclass\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\binterface\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\bobject\s+(\w+)/g, group: 1 },
        { type: 'variable', regex: /\b(var|val)\s+(\w+)/g, group: 2 },
        { type: 'constant', regex: /\bcompanion\s+object/g, group: 0 },
        { type: 'parameter', regex: /\bfun\s+\w+\s*\(([^)]*)\)/g, group: 1, split: true },
        { type: 'imported', regex: /\bimport\s+([\w.]+)/g, group: 1, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*[=;]/g, group: 1, isRef: true },
    ],
    java: [
        { type: 'class', regex: /\b(class|interface|enum)\s+(\w+)/g, group: 2 },
        { type: 'method', regex: /\b(public|private|protected|static|\s)+\s+\w+(?:<[^>]+>)?\s+(\w+)\s*\(/g, group: 2 },
        { type: 'variable', regex: /\b(int|long|float|double|boolean|char|String|var)\s+(\w+)/g, group: 2 },
        { type: 'constant', regex: /\bstatic\s+final\s+\w+\s+([A-Z_][A-Z0-9_]*)/g, group: 1 },
        { type: 'imported', regex: /\bimport\s+([\w.]+);/g, group: 1, isImport: true },
        { type: 'property', regex: /\.(\w+)\s*[=;]/g, group: 1, isRef: true },
    ],
    'text/x-csharp': [
        { type: 'class', regex: /\b(class|interface|struct|enum)\s+(\w+)/g, group: 2 },
        { type: 'method', regex: /\b(public|private|protected|static|async|\s)+\s+\w+(?:<[^>]+>)?\s+(\w+)\s*\(/g, group: 2 },
        { type: 'variable', regex: /\b(int|long|float|double|bool|char|string|var)\s+(\w+)/gi, group: 2 },
        { type: 'imported', regex: /\busing\s+([\w.]+);/g, group: 1, isImport: true },
        { type: 'property', regex: /\.(\w+)\s*[=;]/g, group: 1, isRef: true },
    ],
    'text/x-csrc': [
        { type: 'function', regex: /\b(\w+)\s*\([^)]*\)\s*\{/g, group: 1 },
        { type: 'variable', regex: /\b(int|float|double|char|void|bool|size_t|ssize_t)\s+(\w+)/g, group: 2 },
        { type: 'imported', regex: /\b#include\s*[<"]([^>"]+)[>"]/g, group: 1, isImport: true },
        { type: 'property', regex: /\.(\w+)\s*[=;]/g, group: 1, isRef: true },
    ],
    'text/x-c++src': [
        { type: 'class', regex: /\b(class|struct)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(\w+)\s*\([^)]*\)\s*\{/g, group: 1 },
        { type: 'variable', regex: /\b(int|float|double|char|void|bool|auto|size_t)\s+(\w+)/g, group: 2 },
        { type: 'imported', regex: /\b#include\s*[<"]([^>"]+)[>"]/g, group: 1, isImport: true },
        { type: 'property', regex: /\.(\w+)\s*[=;]/g, group: 1, isRef: true },
    ],
    r: [
        { type: 'function', regex: /\b(\w+)\s*(?:<-|=)\s*function/g, group: 1 },
        { type: 'variable', regex: /\b(\w+)\s*(?:<-|=)/g, group: 1 },
        { type: 'library', regex: /\b(library|require)\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)/g, group: 2, isImport: true },
        { type: 'imported', regex: /\b(source)\s*\(\s*['"]([^'"]+)['"]\s*\)/g, group: 2, isImport: true },
        { type: 'method', regex: /\$(\w+)/g, group: 1, isRef: true },
        { type: 'method', regex: /\@(\w+)/g, group: 1, isRef: true },
    ],
    sql: [
        { type: 'function', regex: /\b(CREATE\s+(?:FUNCTION|PROCEDURE|TRIGGER))\s+(\w+)/gi, group: 2 },
        { type: 'class', regex: /\b(CREATE\s+TABLE)\s+(\w+)/gi, group: 2 },
        { type: 'class', regex: /\b(CREATE\s+VIEW)\s+(\w+)/gi, group: 2 },
        { type: 'variable', regex: /\b(@\w+)/g, group: 1 },
        { type: 'imported', regex: /\b(USE)\s+(\w+)/gi, group: 2, isImport: true },
        { type: 'property', regex: /\b(\w+)\s+(?:INT|VARCHAR|TEXT|FLOAT|DOUBLE|DATE|BOOLEAN|CHAR|DECIMAL|BLOB|INTEGER|NUMERIC|REAL|CLOB)/gi, group: 1 },
    ],
    bash: [
        { type: 'function', regex: /\bfunction\s+(\w+)/g, group: 1 },
        { type: 'function', regex: /^(\w+)\s*\(\)\s*\{/gm, group: 1 },
        { type: 'variable', regex: /\b(\w+)=/g, group: 1 },
        { type: 'variable', regex: /\$(\w+)/g, group: 1 },
        { type: 'variable', regex: /\$\{(\w+)\}/g, group: 1 },
        { type: 'imported', regex: /\b(source|\.)\s+['"]([^'"]+)['"]/g, group: 2, isImport: true },
    ],
    shell: [
        { type: 'function', regex: /\bfunction\s+(\w+)/g, group: 1 },
        { type: 'function', regex: /^(\w+)\s*\(\)\s*\{/gm, group: 1 },
        { type: 'variable', regex: /\b(\w+)=/g, group: 1 },
        { type: 'variable', regex: /\$(\w+)/g, group: 1 },
        { type: 'variable', regex: /\$\{(\w+)\}/g, group: 1 },
        { type: 'imported', regex: /\b(source|\.)\s+['"]([^'"]+)['"]/g, group: 2, isImport: true },
    ],
    perl: [
        { type: 'function', regex: /\bsub\s+(\w+)/g, group: 1 },
        { type: 'variable', regex: /\b(my|our|local)\s+(\w+)/g, group: 2 },
        { type: 'variable', regex: /\$(\w+)/g, group: 1 },
        { type: 'variable', regex: /@(\w+)/g, group: 1 },
        { type: 'variable', regex: /%(\w+)/g, group: 1 },
        { type: 'constant', regex: /\buse\s+constant\s+(\w+)/g, group: 1 },
        { type: 'imported', regex: /\buse\s+(\w+)/g, group: 1, isImport: true },
        { type: 'imported', regex: /\brequire\s+(\w+)/g, group: 1, isImport: true },
        { type: 'method', regex: /->(\w+)\s*\(/g, group: 1, isRef: true },
    ],
    lua: [
        { type: 'function', regex: /\bfunction\s+(\w+(?:\.\w+)*)/g, group: 1 },
        { type: 'function', regex: /\b(\w+)\s*(?:=\s*function)/g, group: 1 },
        { type: 'variable', regex: /\b(local)\s+(\w+)/g, group: 2 },
        { type: 'variable', regex: /\b(\w+)\s*=/g, group: 1 },
        { type: 'imported', regex: /\b(require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g, group: 2, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*[=]/g, group: 1, isRef: true },
    ],
    haskell: [
        { type: 'function', regex: /\b(\w+)\s*(?:::)/g, group: 1 },
        { type: 'function', regex: /^(\w+)\s+/gm, group: 1 },
        { type: 'class', regex: /\bdata\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\btype\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\bnewtype\s+(\w+)/g, group: 1 },
        { type: 'class', regex: /\bclass\s+(\w+)/g, group: 1 },
        { type: 'variable', regex: /\b(let)\s+(\w+)/g, group: 2 },
        { type: 'variable', regex: /\b(where)\s+(\w+)/g, group: 2 },
        { type: 'imported', regex: /\bimport\s+(?:qualified\s+)?(\w[\w.]*)/g, group: 1, isImport: true },
        { type: 'parameter', regex: /\b(\w+)\s*::/g, group: 1 },
    ],
    dart: [
        { type: 'function', regex: /\b(\w+)\s*\([^)]*\)\s*(?:async\s+)?(?:\{|=>)/g, group: 1 },
        { type: 'class', regex: /\bclass\s+(\w+)/g, group: 1 },
        { type: 'variable', regex: /\b(var|final|const|late)\s+(\w+)/g, group: 2 },
        { type: 'variable', regex: /\b(\w+)\s*(?::\s*\w+(?:<[^>]+>)?)\s*=/g, group: 1 },
        { type: 'parameter', regex: /\b(\w+)\s*\([^)]*\)\s*(?:async\s+)?(?:\{|=>)/g, group: 1 },
        { type: 'imported', regex: /\bimport\s+['"]([^'"]+)['"]/g, group: 1, isImport: true },
        { type: 'imported', regex: /\bimport\s+['"]([^'"]+)['"]\s+as\s+(\w+)/g, group: 1, isImport: true },
        { type: 'method', regex: /\.(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\.(\w+)\s*[=;]/g, group: 1, isRef: true },
    ],
    vue: [
        { type: 'property', regex: /\b(class|id|href|src|style|data-\w+|v-\w+|@\w+)="([^"]*)"/g, group: 2 },
        { type: 'variable', regex: /\b(var|let|const)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(function)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>/g, group: 2 },
        { type: 'method', regex: /\bmethods\s*:\s*\{([^}]+)\}/g, group: 1 },
        { type: 'property', regex: /\bdata\s*\(\)\s*\{([^}]+)\}/g, group: 1 },
        { type: 'imported', regex: /\bimport\s+(?:{[^}]+}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g, group: 1, isImport: true },
        { type: 'template', regex: /\{\{([^}]+)\}\}/g, group: 1 },
    ],
    svelte: [
        { type: 'property', regex: /\b(class|id|href|src|style|data-\w+|bind:\w+|on:\w+|use:\w+| transition:\w+)=["']?([^"'\s>]+)/g, group: 2 },
        { type: 'variable', regex: /\b(var|let|const)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\bfunction\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>/g, group: 2 },
        { type: 'imported', regex: /\bimport\s+(?:{[^}]+}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g, group: 1, isImport: true },
        { type: 'template', regex: /\{#(\w+)[^}]*\}/g, group: 1 },
        { type: 'template', regex: /\{[^#\/][^}]*\}/g, group: 0 },
    ],
    jsx: [
        { type: 'class', regex: /\b(class)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(function)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\b(const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>/g, group: 2 },
        { type: 'variable', regex: /\b(const|let|var)\s+(\w+)/g, group: 2 },
        { type: 'component', regex: /<([A-Z]\w+)/g, group: 1 },
        { type: 'imported', regex: /\bimport\s+(?:{[^}]+}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g, group: 1, isImport: true },
        { type: 'property', regex: /\b(\w+)=\{/g, group: 1 },
        { type: 'template', regex: /\{([^}]+)\}/g, group: 1 },
    ],
    blade: [
        { type: 'template', regex: /@\w+\s*\(?['"]?([^'")\s]+)['"]?\)?/g, group: 1 },
        { type: 'template', regex: /\{\{\s*([^}]+)\s*\}\}/g, group: 1 },
        { type: 'variable', regex: /\$(\w+)/g, group: 1 },
        { type: 'property', regex: /\$this->(\w+)/g, group: 1 },
        { type: 'method', regex: /\$this->(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\b(class|id|href|src|style)="([^"]*)"/g, group: 2 },
    ],
    twig: [
        { type: 'template', regex: /\{\{\s*([^}]+)\s*\}\}/g, group: 1 },
        { type: 'template', regex: /\{%\s*(\w+)/g, group: 1 },
        { type: 'variable', regex: /\b(var|let|const)\s+(\w+)/g, group: 2 },
        { type: 'property', regex: /\b(class|id|href|src|style)="([^"]*)"/g, group: 2 },
        { type: 'function', regex: /\b(\w+)\s*\([^)]*\)/g, group: 1 },
    ],
    django: [
        { type: 'template', regex: /\{\{\s*([^}]+)\s*\}\}/g, group: 1 },
        { type: 'template', regex: /\{%\s*(\w+)/g, group: 1 },
        { type: 'variable', regex: /\b(var|let|const)\s+(\w+)/g, group: 2 },
        { type: 'property', regex: /\b(class|id|href|src|style)="([^"]*)"/g, group: 2 },
    ],
    erb: [
        { type: 'template', regex: /<%=\s*([^%]+)\s*%>/g, group: 1 },
        { type: 'template', regex: /<%\s*([^%]+)\s*%>/g, group: 1 },
        { type: 'variable', regex: /@(\w+)/g, group: 1 },
        { type: 'property', regex: /\b(class|id|href|src|style)="([^"]*)"/g, group: 2 },
        { type: 'function', regex: /\b(\w+)\s*\([^)]*\)/g, group: 1 },
    ],
    asp: [
        { type: 'function', regex: /\b(?:public|private|protected|\s)+\s+\w+\s+(\w+)\s*\(/g, group: 1 },
        { type: 'variable', regex: /\b(Dim|Set|Private|Public)\s+(\w+)/gi, group: 2 },
        { type: 'constant', regex: /\bconst\s+(\w+)/gi, group: 1 },
        { type: 'template', regex: /<%=\s*([^%]+)\s*%>/g, group: 1 },
        { type: 'property', regex: /\b(class|id|href|src|style)="([^"]*)"/g, group: 2 },
    ],
    'text/htmlmixed': [
        { type: 'property', regex: /\b(class|id|href|src|style|data-\w+|ng-\w+|v-\w+|@\w+|bind:\w+|on:\w+)="([^"]*)"/g, group: 2 },
        { type: 'variable', regex: /\b(var|let|const)\s+(\w+)/g, group: 2 },
        { type: 'function', regex: /\bon(\w+)\s*=\s*["']([^"']*)/g, group: 2 },
        { type: 'variable', regex: /\$(\w+)/g, group: 1 },
        { type: 'function', regex: /\b(\w+)\s*\([^)]*\)/g, group: 1 },
    ],
    'htmlembedded': [
        { type: 'template', regex: /@\w+\s*\(?['"]?([^'")\s]+)['"]?\)?/g, group: 1 },
        { type: 'template', regex: /\{\{\s*([^}]+)\s*\}\}/g, group: 1 },
        { type: 'variable', regex: /\$(\w+)/g, group: 1 },
        { type: 'property', regex: /\$this->(\w+)/g, group: 1 },
        { type: 'method', regex: /\$this->(\w+)\s*\(/g, group: 1, isRef: true },
        { type: 'property', regex: /\b(class|id|href|src|style)="([^"]*)"/g, group: 2 },
        { type: 'function', regex: /\b(function)\s+(\w+)/g, group: 2 },
        { type: 'variable', regex: /\b(var|let|const)\s+(\w+)/g, group: 2 },
    ],
    'text/x-htmlembedded': [
        { type: 'template', regex: /\{\{\s*([^}]+)\s*\}\}/g, group: 1 },
        { type: 'template', regex: /\{%\s*(\w+)/g, group: 1 },
        { type: 'variable', regex: /\b(var|let|const)\s+(\w+)/g, group: 2 },
        { type: 'property', regex: /\b(class|id|href|src|style)="([^"]*)"/g, group: 2 },
        { type: 'function', regex: /\b(\w+)\s*\([^)]*\)/g, group: 1 },
    ],
    'text/css': [
        { type: 'property', regex: /\.([a-zA-Z_][\w-]*)\s*\{/g, group: 1 },
        { type: 'property', regex: /#([a-zA-Z_][\w-]*)\s*\{/g, group: 1 },
        { type: 'property', regex: /\[data-([a-zA-Z_][\w-]*)\]/g, group: 1 },
    ],
};

function analyzeCode(code, language) {
    const nodes = new Map();
    const links = [];
    const lines = code.split('\n');

    function getLine(n) { return n < lines.length ? lines[n] : ''; }

    function addNode(name, type, line, context) {
        if (!name || name.length < 2 || /^\d+$/.test(name)) return;
        if (RESERVED.has(name)) return;
        if (name.length > 50) return;
        if (/^[A-Z_][A-Z0-9_]*$/.test(name) && type === 'variable') type = 'constant';
        if (!nodes.has(name)) {
            nodes.set(name, { id: name, type, line, context: context || '', connections: new Set() });
        } else if (nodes.get(name).type === 'default' && type !== 'default') {
            nodes.get(name).type = type;
        }
    }

    function addLink(fromId, toId, linkType) {
        if (fromId === toId) return;
        if (!nodes.has(fromId) || !nodes.has(toId)) return;
        const key = `${fromId}->${toId}`;
        links.push({ source: fromId, target: toId, key, linkType: linkType || 'ref' });
    }

    const rules = analyzerRules[language] || analyzerRules.javascript;
    const allNames = new Set();

    for (const rule of rules) {
        let match;
        const regex = new RegExp(rule.regex.source, rule.regex.flags);
        while ((match = regex.exec(code)) !== null) {
            const ln = code.substring(0, match.index).split('\n').length - 1;
            const ctx = getLine(ln).trim();
            if (rule.split) {
                match[rule.group].split(',').map(p => p.trim().split('=')[0].split(':')[0].replace(/^\?/, '').trim())
                    .filter(p => p && /^[a-zA-Z_$]\w*$/.test(p)).forEach(p => { addNode(p, 'parameter', ln, ctx); allNames.add(p); });
            } else if (rule.isImport) {
                const n = match[rule.group]; addNode(n, 'imported', ln, ctx); allNames.add(n);
            } else if (rule.isRef) {
                const n = match[rule.group]; addNode(n, rule.type, ln, ctx); allNames.add(n);
            } else {
                const n = match[rule.group]; addNode(n, rule.type, ln, ctx); allNames.add(n);
            }
        }
    }

    for (const rule of rules) {
        if (rule.isRef || rule.split || rule.isImport) continue;
        let match;
        const regex = new RegExp(rule.regex.source, rule.regex.flags);
        while ((match = regex.exec(code)) !== null) {
            const defName = match[rule.group];
            if (!defName) continue;

            const ln = code.substring(0, match.index).split('\n').length - 1;

            for (let i = Math.max(0, ln - 3); i < Math.min(lines.length, ln + 15); i++) {
                const line = lines[i];
                for (const name of allNames) {
                    if (name === defName) continue;
                    if (name.length > 1 && line.includes(name)) {
                        const targetNode = nodes.get(name);
                        if (targetNode) {
                            let linkType = 'uses';
                            if (targetNode.type === 'imported') linkType = 'imports';
                            else if (targetNode.type === 'function') linkType = 'calls';
                            else if (targetNode.type === 'class') linkType = 'depends';
                            else if (targetNode.type === 'parameter') linkType = 'receives';
                            else if (targetNode.type === 'constant') linkType = 'references';
                            addLink(defName, name, linkType);
                        }
                    }
                }
            }
        }
    }

    const allNamesArr = Array.from(allNames);
    for (let i = 0; i < allNamesArr.length; i++) {
        for (let j = i + 1; j < allNamesArr.length; j++) {
            const a = nodes.get(allNamesArr[i]);
            const b = nodes.get(allNamesArr[j]);
            if (!a || !b) continue;

            const aLine = a.line || 0;
            const bLine = b.line || 0;

            if (Math.abs(aLine - bLine) <= 2 && aLine !== bLine) {
                const nearLines = lines.slice(Math.min(aLine, bLine), Math.max(aLine, bLine) + 2).join(' ');
                if (nearLines.includes(a.id) && nearLines.includes(b.id)) {
                    if (a.type === 'function' && b.type === 'variable') addLink(a.id, b.id, 'uses');
                    else if (a.type === 'variable' && b.type === 'function') addLink(b.id, a.id, 'calls');
                    else if (a.type === 'class' && b.type === 'method') addLink(a.id, b.id, 'defines');
                    else if (a.type === 'imported' && b.type !== 'imported') addLink(a.id, b.id, 'provides');
                }
            }
        }
    }

    const nodeList = Array.from(nodes.values()).map(n => ({
        ...n, connections: Array.from(n.connections), color: COLORS[n.type] || COLORS.default
    }));

    const uniqueLinks = [];
    const linkSet = new Set();
    for (const l of links) {
        if (!linkSet.has(l.key)) { linkSet.add(l.key); uniqueLinks.push({ source: l.source, target: l.target, linkType: l.linkType }); }
    }

    const LINK_PRIORITY = { 'defines': 1, 'calls': 2, 'imports': 3, 'provides': 4, 'depends': 5, 'receives': 6, 'references': 7, 'uses': 8, 'ref': 9 };

    const pairBest = new Map();
    for (const l of uniqueLinks) {
        const key = `${l.source}->${l.target}`;
        const prev = pairBest.get(key);
        if (!prev || (LINK_PRIORITY[l.linkType] || 9) < (LINK_PRIORITY[prev.linkType] || 9)) {
            pairBest.set(key, l);
        }
    }

    const MAX_LINKS_PER_NODE = 3;
    const filtered = Array.from(pairBest.values()).sort(
        (a, b) => (LINK_PRIORITY[a.linkType] || 9) - (LINK_PRIORITY[b.linkType] || 9)
    );
    const countPerNode = new Map();
    const cappedLinks = [];
    for (const l of filtered) {
        const s = countPerNode.get(l.source) || 0;
        const t = countPerNode.get(l.target) || 0;
        if (s < MAX_LINKS_PER_NODE && t < MAX_LINKS_PER_NODE) {
            cappedLinks.push(l);
            countPerNode.set(l.source, s + 1);
            countPerNode.set(l.target, t + 1);
        }
    }

    nodeList.forEach(n => {
        const conns = new Set();
        cappedLinks.forEach(l => {
            if (l.source === n.id) conns.add(l.target);
            if (l.target === n.id) conns.add(l.source);
        });
        n.connections = Array.from(conns);
    });

    return { nodes: nodeList, links: cappedLinks };
}

function initGraph() {
    const container = document.getElementById('graph-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg = d3.select('#graph').attr('width', width).attr('height', height);
    svg.selectAll('*').remove();
    defs = svg.append('defs');

    const markerColors = ['#ff6b6b','#4ecdc4','#ffd93d','#c084fc','#60a5fa','#34d399','#f97316','#a78bfa','#f472b6'];
    markerColors.forEach((c, i) => {
        defs.append('marker').attr('id', `arrow-${i}`).attr('viewBox', '0 -6 14 12').attr('refX', 13).attr('refY', 0)
            .attr('markerWidth', 14).attr('markerHeight', 14).attr('orient', 'auto')
            .append('path').attr('d', 'M0,-6L14,0L0,6Z').attr('fill', c);
    });
    defs.append('marker').attr('id', 'arrow-default').attr('viewBox', '0 -6 14 12').attr('refX', 13).attr('refY', 0)
        .attr('markerWidth', 14).attr('markerHeight', 14).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-6L14,0L0,6Z').attr('fill', '#666');

    const zoom = d3.zoom().scaleExtent([0.15, 3]).on('zoom', (e) => mainGroup.attr('transform', e.transform));
    svg.call(zoom);

    mainGroup = svg.append('g');
    linkGroup = mainGroup.append('g').attr('class', 'links');
    nodeGroup = mainGroup.append('g').attr('class', 'nodes');

    window._graphZoom = zoom;

    document.getElementById('resetZoom').addEventListener('click', () => {
        if (data && data.nodes.length) {
            autoFitZoom();
        } else {
            svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
        }
    });

    document.getElementById('toggleEditor').addEventListener('click', () => {
        document.getElementById('editorOverlay').classList.toggle('hidden');
    });

    document.getElementById('closeEditor').addEventListener('click', () => {
        document.getElementById('editorOverlay').classList.add('hidden');
    });

    document.getElementById('toggleUnrecognized').addEventListener('click', () => {
        document.getElementById('unrecognizedOverlay').classList.toggle('hidden');
        document.getElementById('toggleUnrecognized').classList.toggle('active');
    });
    document.getElementById('closeUnrecognized').addEventListener('click', () => {
        document.getElementById('unrecognizedOverlay').classList.add('hidden');
        document.getElementById('toggleUnrecognized').classList.remove('active');
    });

    document.getElementById('toggleInfo').addEventListener('click', () => {
        document.getElementById('infoOverlay').classList.toggle('hidden');
        document.getElementById('toggleInfo').classList.toggle('active');
    });
    document.getElementById('closeInfo').addEventListener('click', () => {
        document.getElementById('infoOverlay').classList.add('hidden');
        document.getElementById('toggleInfo').classList.remove('active');
    });
}

function renderZoneFilters() {
    const el = document.getElementById('zoneFilters');
    if (!el) return;
    el.innerHTML = COLUMN_LABELS.map((label, c) =>
        `<button class="zone-chip ${activeZones.has(c) ? 'active' : 'off'}" data-zone="${c}" style="--zc:${COLUMN_COLORS[c]}" title="Mostrar/ocultar ${label}"><span class="dot"></span>${label}</button>`
    ).join('');
    el.querySelectorAll('.zone-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const c = Number(btn.dataset.zone);
            if (activeZones.has(c)) activeZones.delete(c); else activeZones.add(c);
            renderZoneFilters();
            if (fullData) updateGraph(fullData);
        });
    });
}

function buildChains(data) {    const adj = new Map();
    data.nodes.forEach(n => adj.set(n.id, new Set()));
    data.links.forEach(l => {
        if (adj.has(l.source)) adj.get(l.source).add(l.target);
        if (adj.has(l.target)) adj.get(l.target).add(l.source);
    });

    const visited = new Set();
    const chains = [];

    function bfs(startId) {
        const chain = [];
        const queue = [startId];
        const seen = new Set([startId]);
        while (queue.length) {
            const id = queue.shift();
            chain.push(id);
            const neighbors = Array.from(adj.get(id) || []);
            neighbors.sort((a, b) => {
                const na = data.nodes.find(n => n.id === a);
                const nb = data.nodes.find(n => n.id === b);
                return (na?.line || 0) - (nb?.line || 0);
            });
            for (const nb of neighbors) {
                if (!seen.has(nb)) { seen.add(nb); queue.push(nb); }
            }
        }
        chain.sort((a, b) => {
            const na = data.nodes.find(n => n.id === a);
            const nb = data.nodes.find(n => n.id === b);
            return (na?.line || 0) - (nb?.line || 0);
        });
        return chain;
    }

    const sorted = data.nodes.slice().sort((a, b) => (a.line || 0) - (b.line || 0));
    for (const n of sorted) {
        if (!visited.has(n.id) && (adj.get(n.id)?.size || 0) > 0) {
            const chain = bfs(n.id);
            chain.forEach(id => visited.add(id));
            chains.push(chain);
        }
    }

    const isolated = data.nodes.filter(n => !visited.has(n.id)).map(n => n.id);
    if (isolated.length) chains.push(isolated);

    return chains;
}

const COLUMN_TYPES = [
    ['imported', 'template'],
    ['constant', 'variable', 'property'],
    ['class', 'function'],
    ['parameter', 'method'],
];
const COLUMN_LABELS = ['Entradas', 'Datos', 'Lógica', 'Salidas'];
const COLUMN_COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6'];
const MAX_ZONE_NODES = 8;
let activeZones = new Set([0, 1, 2, 3]);
let expandedZones = new Set();
let fullData = null;

function nodeZone(node) {
    if (node.zone !== undefined) return node.zone;
    for (let c = 0; c < COLUMN_TYPES.length; c++) {
        if (COLUMN_TYPES[c].includes(node.type)) return c;
    }
    return COLUMN_TYPES.length - 1;
}

function filterGraphData(raw) {
    let nodes = raw.nodes.filter(n => n.id.startsWith('__extra') || activeZones.has(nodeZone(n)));
    const extraNodes = [];
    for (let c = 0; c < COLUMN_TYPES.length; c++) {
        if (!activeZones.has(c) || expandedZones.has(c)) continue;
        const zoneNodes = nodes.filter(n => nodeZone(n) === c).sort((a, b) => (a.line || 0) - (b.line || 0));
        if (zoneNodes.length > MAX_ZONE_NODES) {
            const hiddenIds = new Set(zoneNodes.slice(MAX_ZONE_NODES).map(n => n.id));
            nodes = nodes.filter(n => !hiddenIds.has(n.id));
            extraNodes.push({
                id: `__extra_${c}__`,
                type: 'default',
                zone: c,
                line: zoneNodes[zoneNodes.length - 1].line + 1,
                connections: [],
                color: COLUMN_COLORS[c],
                extraCount: hiddenIds.size,
            });
        }
    }
    const all = nodes.concat(extraNodes);
    const allIds = new Set(all.map(n => n.id));
    const links = raw.links.filter(l => allIds.has(l.source) && allIds.has(l.target));
    return { nodes: all, links };
}

function computeLayout(data) {
    const container = document.getElementById('graph-container');
    const W = container.clientWidth;
    const H = container.clientHeight;

    const NODE_W = 250, NODE_H = 82;
    const H_GAP = 210, SUB_GAP = 96, V_GAP = 84, MARGIN = 100;
    const MAX_ROWS = 8;

    const columns = COLUMN_TYPES.map(() => []);
    const assigned = new Set();

    for (const node of data.nodes) {
        if (node.zone !== undefined) {
            columns[node.zone].push(node);
            assigned.add(node.id);
            continue;
        }
        for (let c = 0; c < COLUMN_TYPES.length; c++) {
            if (COLUMN_TYPES[c].includes(node.type)) {
                columns[c].push(node);
                assigned.add(node.id);
                break;
            }
        }
    }

    const unassigned = data.nodes.filter(n => !assigned.has(n.id));
    if (unassigned.length) columns[columns.length - 1].push(...unassigned);

    columns.forEach(col => col.sort((a, b) => (a.line || 0) - (b.line || 0)));

    const zones = [];
    for (let c = 0; c < columns.length; c++) {
        if (!columns[c].length) continue;
        const k = Math.min(2, Math.ceil(columns[c].length / MAX_ROWS));
        const subs = [];
        for (let s = 0; s < k; s++) subs.push(columns[c].slice(s * MAX_ROWS, (s + 1) * MAX_ROWS));
        if (columns[c].length > k * MAX_ROWS) subs[k - 1].push(...columns[c].slice(k * MAX_ROWS));
        zones.push({ c, subs });
    }

    let xCursor = 0;
    const zoneX = [];
    for (const z of zones) {
        zoneX.push(xCursor);
        xCursor += z.subs.length * NODE_W + (z.subs.length - 1) * SUB_GAP + H_GAP;
    }
    const totalWidth = xCursor - H_GAP;
    const startX = Math.max((W - totalWidth) / 2, MARGIN);

    const PITCH = NODE_H + V_GAP;
    const HALF_PITCH = PITCH / 2;

    const pos = {};
    for (let zi = 0; zi < zones.length; zi++) {
        const z = zones[zi];
        const zx = startX + zoneX[zi];
        const rowsInZone = z.subs.reduce((m, s) => Math.max(m, s.length), 0);
        const totalH = (rowsInZone - 1) * PITCH + NODE_H + (z.subs.length > 1 ? HALF_PITCH : 0);
        const startY = (H - totalH) / 2;

        z.subs.forEach((sub, s) => {
            const subX = zx + s * (NODE_W + SUB_GAP);
            const off = (s % 2) * HALF_PITCH;
            for (let r = 0; r < sub.length; r++) {
                const node = sub[r];
                pos[node.id] = {
                    x: subX,
                    y: startY + off + r * PITCH,
                    w: NODE_W,
                    h: NODE_H,
                    col: z.c,
                    sub: s,
                    row: r,
                    color: node.color,
                    data: node
                };
            }
        });
    }

    return pos;
}

function getMarkerId(color) {
    const idx = ['#ff6b6b','#4ecdc4','#ffd93d','#c084fc','#60a5fa','#34d399','#f97316','#a78bfa','#f472b6'].indexOf(color);
    return idx >= 0 ? `arrow-${idx}` : 'arrow-default';
}

function getLinkInfo(source, target, linkType) {
    if (!source || !target) return null;

    const s = source.type, t = target.type;
    const sName = source.id, tName = target.id;

    const linkTypeMap = {
        'uses': { label: `${sName} usa ${tName}`, desc: `${sName} depende de ${tName} para funcionar`, style: 'solid', color: '#00d9ff', icon: '→' },
        'calls': { label: `${sName} llama a ${tName}`, desc: `${sName} ejecuta ${tName}`, style: 'solid', color: '#ff4d6d', icon: '▶' },
        'imports': { label: `${sName} importa ${tName}`, desc: `${sName} carga el módulo ${tName}`, style: 'dotted', color: '#8b5cf6', icon: '◆' },
        'provides': { label: `${sName} provee ${tName}`, desc: `Módulo ${sName} exporta ${tName}`, style: 'dotted', color: '#f72585', icon: '◇' },
        'defines': { label: `${sName} define ${tName}`, desc: `${sName} contiene la definición de ${tName}`, style: 'solid', color: '#ffd60a', icon: '●' },
        'depends': { label: `${sName} depende de ${tName}`, desc: `${sName} necesita ${tName}`, style: 'dashed', color: '#fb8500', icon: '△' },
        'receives': { label: `${sName} recibe ${tName}`, desc: `${sName} acepta parámetro ${tName}`, style: 'dashed', color: '#06d6a0', icon: '⊃' },
        'references': { label: `${sName} referencia ${tName}`, desc: `${sName} usa el valor de ${tName}`, style: 'solid', color: '#3a86ff', icon: '=' },
    };

    return linkTypeMap[linkType] || {
        label: `${sName} → ${tName}`,
        desc: `Conexión entre ${TYPE_LABELS[s] || s} y ${TYPE_LABELS[t] || t}`,
        style: 'solid',
        color: '#666',
        icon: '→'
    };
}

function updateLinksForNode(nodeId, pos, data) {
    linkGroup.selectAll('path').each(function () {
        const src = d3.select(this).attr('data-source');
        const tgt = d3.select(this).attr('data-target');
        if (src !== nodeId && tgt !== nodeId) return;

        const s = pos[src], t = pos[tgt];
        if (!s || !t) return;

        const o = this._pathInfo || { lane: 0, fanS: 0, fanT: 0, laneSmall: 0, laneY: 0, longRange: false };
        const pathD = buildLinkPath(s, t, o);

        d3.select(this).attr('d', pathD);
    });
}

function buildLinkPath(s, t, o) {
    const sy = s.y + s.h / 2 + o.fanS * 10;
    const ty = t.y + t.h / 2 + o.fanT * 10;
    const sx = s.x + s.w;
    const tx = t.x;
    if (sy === ty) return `M ${sx},${sy} L ${tx},${ty}`;
    const midX = (sx + tx) / 2 + o.lane;
    return `M ${sx},${sy} L ${midX},${sy} L ${midX},${ty} L ${tx},${ty}`;
}

function getZoneGradId(c) {
    const id = `zone-grad-${c}`;
    if (document.getElementById(id)) return id;
    const grad = defs.append('linearGradient').attr('id', id).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', COLUMN_COLORS[c]).attr('stop-opacity', 0.16);
    grad.append('stop').attr('offset', '100%').attr('stop-color', COLUMN_COLORS[c]).attr('stop-opacity', 0.02);
    return id;
}

function getNodeGradId(c) {
    const id = `node-grad-${c.replace('#', '')}`;
    if (document.getElementById(id)) return id;
    const grad = defs.append('linearGradient').attr('id', id).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', c).attr('stop-opacity', 0.30);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#0a0e18').attr('stop-opacity', 1);
    return id;
}

function getNodeHiId() {
    if (document.getElementById('node-hi')) return 'node-hi';
    const grad = defs.append('linearGradient').attr('id', 'node-hi').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff').attr('stop-opacity', 0.14);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#ffffff').attr('stop-opacity', 0);
    return 'node-hi';
}

function getFlowGradId(ca, cb, x1, x2) {
    const id = `flow-grad-${ca.replace('#', '')}-${cb.replace('#', '')}`;
    if (document.getElementById(id)) return id;
    const grad = defs.append('linearGradient').attr('id', id).attr('gradientUnits', 'userSpaceOnUse').attr('x1', x1).attr('y1', 0).attr('x2', x2).attr('y2', 0);
    grad.append('stop').attr('offset', '0%').attr('stop-color', ca).attr('stop-opacity', 0.6);
    grad.append('stop').attr('offset', '100%').attr('stop-color', cb).attr('stop-opacity', 0.6);
    return id;
}

function computeMainChain(data, pos) {
    const preds = new Map();
    for (const n of data.nodes) preds.set(n.id, []);
    for (const link of data.links) {
        const s = pos[link.source], t = pos[link.target];
        if (!s || !t) continue;
        if (t.col > s.col) preds.get(link.target).push(link.source);
    }
    const sorted = [...data.nodes].sort((a, b) => pos[a.id].col - pos[b.id].col || a.line - b.line);
    const dp = new Map(), prev = new Map();
    let best = null;
    for (const n of sorted) {
        let len = 1, prevBest = null;
        for (const p of preds.get(n.id)) {
            if ((dp.get(p) || 0) + 1 > len) { len = dp.get(p) + 1; prevBest = p; }
        }
        dp.set(n.id, len);
        prev.set(n.id, prevBest);
        if (!best || len > dp.get(best)) best = n.id;
    }
    const chain = [];
    let cur = best;
    while (cur) { chain.unshift(cur); cur = prev.get(cur); }
    return chain;
}

function updateGraph(rawData) {
    fullData = rawData;
    const data = filterGraphData(rawData);
    graphData = data;
    currentData = data;
    linkGroup.selectAll('*').remove();
    nodeGroup.selectAll('*').remove();
    defs.selectAll('marker').remove();
    const chainBadges = new Map();

    if (data.nodes.length === 0) {
        nodeGroup.append('text').attr('x', svg.attr('width') / 2).attr('y', svg.attr('height') / 2)
            .attr('text-anchor', 'middle').attr('fill', '#555').attr('font-size', '16px')
            .text('Escribe codigo y pulsa Analizar');
        updateLegend();
        return;
    }

    const pos = computeLayout(data);
    const container = document.getElementById('graph-container');
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    let mx = 0, my = 0;
    Object.values(pos).forEach(p => { if (p.x + p.w > mx) mx = p.x + p.w; if (p.y + p.h > my) my = p.y + p.h; });

    const contentW = mx + 60;
    const contentH = my + 80;

    const scaleX = containerW / contentW;
    const scaleY = containerH / contentH;
    const autoScale = Math.max(Math.min(scaleX, scaleY, 1), 0.65);

    svg.attr('width', containerW).attr('height', containerH);

    const zoom = d3.zoom().scaleExtent([0.15, 3]).on('zoom', (e) => mainGroup.attr('transform', e.transform));
    svg.call(zoom);

    const initialTransform = d3.zoomIdentity
        .translate(containerW / 2 - (contentW / 2) * autoScale, containerH / 2 - (contentH / 2) * autoScale)
        .scale(autoScale);
    svg.call(zoom.transform, initialTransform);

    document.getElementById('resetZoom').onclick = () => svg.transition().duration(500).call(zoom.transform, initialTransform);
    window._graphZoom = zoom;

    const colGeom = {};
    for (let c = 0; c < 4; c++) {
        const colNodes = data.nodes.filter(n => pos[n.id] && pos[n.id].col === c);
        if (!colNodes.length) continue;

        const padX = 40, padY = 36;
        const zoneColor = COLUMN_COLORS[c];

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        colNodes.forEach(n => {
            const p = pos[n.id];
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x + p.w);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y + p.h);
        });

        const zx = minX - padX, zy = minY - padY - 26;
        const zw = maxX - minX + padX * 2, zh = maxY - minY + padY * 2 + 26;

        colGeom[c] = { left: zx, right: zx + zw, top: zy };

        const zone = linkGroup.append('rect')
            .attr('x', zx)
            .attr('y', zy)
            .attr('width', zw)
            .attr('height', zh)
            .attr('rx', 16).attr('ry', 16)
            .attr('fill', `url(#${getZoneGradId(c)})`)
            .attr('stroke', zoneColor + '30')
            .attr('stroke-width', 1)
            .style('filter', `drop-shadow(0 0 22px ${zoneColor}18)`)
            .lower();

        zone.on('mouseover', function () {
            d3.select(this)
                .attr('stroke', zoneColor + '55')
                .style('filter', `drop-shadow(0 0 30px ${zoneColor}38)`);
            nodeGroup.selectAll('g').attr('opacity', function (n) {
                return pos[n.id] && pos[n.id].col === c ? 1 : 0.2;
            });
        }).on('mouseout', function () {
            d3.select(this)
                .attr('stroke', zoneColor + '30')
                .style('filter', `drop-shadow(0 0 22px ${zoneColor}18)`);
            nodeGroup.selectAll('g').attr('opacity', 1);
        });

        const pillW = COLUMN_LABELS[c].length * 8.5 + 30;
        linkGroup.append('rect')
            .attr('x', zx + 6)
            .attr('y', zy - 8)
            .attr('width', pillW)
            .attr('height', 16)
            .attr('rx', 8)
            .attr('fill', zoneColor + '2e')
            .attr('stroke', zoneColor + '40')
            .attr('stroke-width', 1)
            .lower();

        linkGroup.append('circle')
            .attr('cx', zx + 6 + 9)
            .attr('cy', zy)
            .attr('r', 3.5)
            .attr('fill', zoneColor)
            .attr('opacity', 0.9)
            .lower();

        linkGroup.append('text')
            .attr('x', zx + 6 + 19)
            .attr('y', zy)
            .attr('dominant-baseline', 'middle')
            .attr('fill', zoneColor)
            .attr('font-size', '11px')
            .attr('font-weight', '700')
            .attr('letter-spacing', '1px')
            .text(COLUMN_LABELS[c])
            .lower();
    }

    const laneMap = new Map();
    for (const link of data.links) {
        const s = pos[link.source], t = pos[link.target];
        if (!s || !t) continue;
        const key = s.col + '->' + t.col;
        if (!laneMap.has(key)) laneMap.set(key, []);
        laneMap.get(key).push(link);
    }
    for (const ls of laneMap.values()) {
        const step = ls.length > 6 ? 34 : ls.length > 3 ? 44 : 52;
        ls.forEach((l, i) => {
            l._lane = (i - (ls.length - 1) / 2) * step;
            l._laneN = ls.length;
            l._laneI = i;
        });
    }

    const srcFan = new Map(), tgtFan = new Map();
    for (const link of data.links) {
        if (!srcFan.has(link.source)) srcFan.set(link.source, []);
        srcFan.get(link.source).push(link);
        if (!tgtFan.has(link.target)) tgtFan.set(link.target, []);
        tgtFan.get(link.target).push(link);
    }
    for (const arr of srcFan.values()) arr.forEach((l, i) => { l._fanS = i; l._fanSN = arr.length; });
    for (const arr of tgtFan.values()) arr.forEach((l, i) => { l._fanT = i; l._fanTN = arr.length; });

    for (const link of data.links) {
        const s = pos[link.source], t = pos[link.target];
        if (!s || !t) continue;

        const sourceNode = data.nodes.find(n => n.id === link.source);
        const targetNode = data.nodes.find(n => n.id === link.target);
        const linkInfo = getLinkInfo(sourceNode, targetNode, link.linkType || 'uses');

        const sx = s.x + s.w;
        const sy = s.y + s.h / 2;
        const tx = t.x;
        const ty = t.y + t.h / 2;

        const fanS = (link._fanS || 0) - ((link._fanSN || 1) - 1) / 2;
        const fanT = (link._fanT || 0) - ((link._fanTN || 1) - 1) / 2;
        const pathD = buildLinkPath(s, t, { lane: link._lane || 0, fanS, fanT });

        const dashArray = linkInfo.style === 'dashed' ? '10,5' : linkInfo.style === 'dotted' ? '4,4' : 'none';
        const linkColor = linkInfo.color || '#666';

        const backward = s.col > t.col;
        const farJump = Math.abs(t.col - s.col) > 1;
        const finalColor = backward || farJump ? '#8b8fa3' : varyColor(linkColor, link._laneI || 0, link._laneN || 1);
        const finalOpacity = farJump ? 0.15 : backward ? 0.3 : 0.5;
        const finalDash = backward || farJump ? '6,4' : dashArray;
        const strokeW = backward || farJump ? 1.5 : linkInfo.style === 'solid' ? 2.5 : 2;

        const linkPath = linkGroup.append('path')
            .attr('d', pathD)
            .attr('fill', 'none')
            .attr('stroke', finalColor)
            .attr('stroke-width', strokeW)
            .attr('stroke-opacity', finalOpacity)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-dasharray', finalDash)
            .attr('marker-end', `url(${getChainMarkerId(finalColor)})`)
            .attr('class', !backward && finalDash !== 'none' ? 'link-anim' : null)
            .attr('data-default-opacity', finalOpacity)
            .attr('data-default-width', strokeW)
            .style('cursor', 'pointer')
            .attr('data-source', link.source)
            .attr('data-target', link.target)
            .on('mouseover', function (event) {
                d3.select(this).attr('stroke-opacity', 1).attr('stroke-width', 5);
                clearAllHighlights();
                showLinkTooltip(event, linkInfo, sourceNode, targetNode);
                if (sourceNode) {
                    if (sourceNode.line !== undefined) highlightCodeLine(sourceNode.line);
                    highlightIdentifier(sourceNode.id, sourceNode.color);
                }
                if (targetNode) {
                    if (targetNode.line !== undefined) highlightCodeLine(targetNode.line);
                    highlightIdentifier(targetNode.id, targetNode.color);
                }
                nodeGroup.selectAll('g').attr('opacity', function (n) {
                    return n.id === link.source || n.id === link.target ? 1 : 0.15;
                });
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke-opacity', finalOpacity).attr('stroke-width', strokeW);
                hideLinkTooltip();
                clearAllHighlights();
                nodeGroup.selectAll('g').attr('opacity', 1);
            });

        linkPath.node()._pathInfo = { lane: link._lane || 0, fanS, fanT };

        if (linkInfo) {
            const mx2 = (sx + tx) / 2;
            const my2 = (sy + ty) / 2;
            const lblOffset = (t.y > s.y) ? 14 : -14;

            const labelBg = linkGroup.append('rect')
                .attr('x', mx2 - 4)
                .attr('y', my2 + lblOffset - 10)
                .attr('width', linkInfo.label.length * 5.8 + 16)
                .attr('height', 18)
                .attr('rx', 9)
                .attr('fill', 'rgba(13, 13, 26, 0.9)')
                .attr('stroke', finalColor + '40')
                .attr('stroke-width', 1)
                .attr('opacity', 0)
                .style('pointer-events', 'none');

            linkPath.on('mouseover.label', function () { labelBg.attr('opacity', 1); });
            linkPath.on('mouseout.label', function () { labelBg.attr('opacity', 0); });

            const labelText = linkGroup.append('text')
                .attr('x', mx2 + 3).attr('y', my2 + lblOffset)
                .attr('text-anchor', 'start')
                .attr('dominant-baseline', 'middle')
                .attr('fill', finalColor).attr('font-size', '9.5px').attr('font-weight', '600').attr('opacity', 0)
                .text(linkInfo.label)
                .style('pointer-events', 'none');

            linkPath.on('mouseover.labeltext', function () { labelText.attr('opacity', 0.95); });
            linkPath.on('mouseout.labeltext', function () { labelText.attr('opacity', 0); });
        }
    }

    const iconMap = { variable: 'V', function: 'F', class: 'C', parameter: 'P', property: '\u00b7', method: 'M', constant: 'K', imported: 'I', template: 'T', default: '?' };

    const ng = nodeGroup.selectAll('g').data(data.nodes).enter().append('g')
        .attr('transform', d => { const p = pos[d.id]; return p ? `translate(${p.x},${p.y})` : 'translate(0,0)'; })
        .style('cursor', 'grab')
        .on('click', (e, d) => {
            if (d.extraCount !== undefined) {
                expandedZones.add(d.zone);
                updateGraph(fullData);
                return;
            }
            showNodeInfo(d);
        })
        .on('mouseover', function (e, d) {
            clearAllHighlights();
            highlightNode(d);
            highlightNodeCode(d);
            linkGroup.selectAll('path').each(function () {
                const src = d3.select(this).attr('data-source');
                const tgt = d3.select(this).attr('data-target');
                if (src === d.id || tgt === d.id) {
                    d3.select(this).attr('stroke-opacity', 1).attr('stroke-width', 5);
                    const otherId = src === d.id ? tgt : src;
                    const otherNode = data.nodes.find(n => n.id === otherId);
                    if (otherNode) {
                        if (otherNode.line !== undefined) highlightCodeLine(otherNode.line);
                        highlightIdentifier(otherNode.id, otherNode.color);
                    }
                }
            });
        })
        .on('mouseout', function () {
            resetHighlight();
            clearAllHighlights();
        })
        .call(d3.drag()
            .on('start', function (event, d) {
                d3.select(this).raise().style('cursor', 'grabbing');
            })
            .on('drag', function (event, d) {
                const p = pos[d.id];
                if (p) {
                    p.x += event.dx;
                    p.y += event.dy;
                    d3.select(this).attr('transform', `translate(${p.x},${p.y})`);
                    updateLinksForNode(d.id, pos, data);
                    const b = chainBadges.get(d.id);
                    if (b) b.attr('transform', `translate(${p.x + p.w - 12},${p.y - 8})`);
                }
            })
            .on('end', function (event, d) {
                d3.select(this).style('cursor', 'grab');
            }));

    ng.each(function (d, i) {
        const g = d3.select(this);
        const p = pos[d.id];
        const w = p ? p.w : 240;
        const h = p ? p.h : 72;
        const c = d.color;
        const isExtra = d.extraCount !== undefined;

        const vis = g.append('g')
            .attr('class', 'node-vis')
            .style('--glow', c + '4d')
            .style('animation-delay', (i * 16) + 'ms');

        vis.append('rect')
            .attr('width', w).attr('height', h)
            .attr('rx', 10).attr('ry', 10)
            .attr('fill', `url(#${getNodeGradId(c)})`)
            .attr('stroke', isExtra ? c + 'aa' : c + '66')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', isExtra ? '6,4' : 'none');

        vis.append('rect')
            .attr('width', w - 20).attr('height', 2)
            .attr('x', 10).attr('y', 0)
            .attr('rx', 1)
            .attr('fill', `url(#${getNodeHiId()})`);

        vis.append('rect')
            .attr('width', 5).attr('height', h - 8)
            .attr('x', 0).attr('y', 4)
            .attr('rx', 2.5).attr('ry', 2.5)
            .attr('fill', c)
            .style('filter', `drop-shadow(0 0 6px ${c}80)`);

        vis.append('rect')
            .attr('x', 14).attr('y', 12)
            .attr('width', 24).attr('height', 24)
            .attr('rx', 6).attr('ry', 6)
            .attr('fill', c + '22')
            .attr('stroke', c + '55')
            .attr('stroke-width', 1);

        vis.append('text')
            .attr('x', 26).attr('y', 24)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
            .attr('fill', c).attr('font-size', '13px').attr('font-weight', '800')
            .attr('font-family', "'Consolas',monospace")
            .text(isExtra ? '+' : (iconMap[d.type] || '?'));

        vis.append('text')
            .attr('x', 46).attr('y', 24)
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#ffffff').attr('font-size', '13.5px')
            .attr('font-family', "'Consolas','Fira Code',monospace").attr('font-weight', '700')
            .text(isExtra ? '+' + d.extraCount + ' más' : (d.id.length > 19 ? d.id.substring(0, 16) + '...' : d.id));

        vis.append('text')
            .attr('x', 14).attr('y', 60)
            .attr('dominant-baseline', 'middle')
            .attr('fill', c).attr('font-size', '10.5px').attr('font-weight', '600')
            .attr('opacity', 0.75)
            .text(isExtra ? 'Clic para mostrar' : (TYPE_LABELS[d.type] || d.type));

        vis.append('text')
            .attr('x', w - 16).attr('y', 60)
            .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
            .attr('fill', '#8a94a8').attr('font-size', '10px')
            .text(isExtra ? '' : (d.line !== undefined ? 'L' + (d.line + 1) : ''));

        vis.append('circle')
            .attr('cx', 6).attr('cy', h / 2)
            .attr('r', 4).attr('fill', c).attr('opacity', 0.5)
            .style('filter', `drop-shadow(0 0 4px ${c}aa)`);

        vis.append('circle')
            .attr('cx', w - 6).attr('cy', h / 2)
            .attr('r', 4).attr('fill', c).attr('opacity', 0.5)
            .style('filter', `drop-shadow(0 0 4px ${c}aa)`);

        vis.append('circle')
            .attr('cx', w - 16).attr('cy', 16)
            .attr('r', 5).attr('fill', c).attr('opacity', 0.5)
            .style('filter', `drop-shadow(0 0 5px ${c}aa)`);
    });

    const mainChain = computeMainChain(data, pos);
    if (mainChain.length >= 2) {
        mainChain.forEach((id, idx) => {
            const p = pos[id];
            if (!p) return;
            const b = nodeGroup.append('g')
                .attr('class', 'chain-badge')
                .attr('transform', `translate(${p.x + p.w - 12},${p.y - 8})`)
                .style('pointer-events', 'none');
            b.append('circle')
                .attr('r', 9.5)
                .attr('fill', '#fbbf24')
                .attr('stroke', '#111827')
                .attr('stroke-width', 1.5)
                .style('filter', 'drop-shadow(0 0 8px rgba(251,191,36,0.85))');
            b.append('text')
                .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
                .attr('fill', '#111827').attr('font-size', '9.5px').attr('font-weight', '800')
                .attr('font-family', "'Consolas',monospace")
                .text(idx + 1);
            chainBadges.set(id, b);
        });
    }

    updateLegend();
    setTimeout(autoFitZoom, 50);
}

let linkTooltipEl = null;

function showLinkTooltip(event, linkInfo, sourceNode, targetNode) {
    hideLinkTooltip();

    linkTooltipEl = document.createElement('div');
    linkTooltipEl.className = 'link-tooltip';
    linkTooltipEl.innerHTML = `
        <div class="lt-title">${linkInfo.icon} ${linkInfo.label}</div>
        <div class="lt-desc">${linkInfo.desc}</div>
        <div class="lt-types">
            <span class="lt-type" style="color:${sourceNode.color}">${TYPE_LABELS[sourceNode.type]}: ${sourceNode.id}</span>
            <span class="lt-arrow">→</span>
            <span class="lt-type" style="color:${targetNode.color}">${TYPE_LABELS[targetNode.type]}: ${targetNode.id}</span>
        </div>
        <div class="lt-hint">Estilo: ${linkInfo.style === 'solid' ? '— Relación directa' : linkInfo.style === 'dashed' ? '- - - Dependencia' : '··· Referencia'}</div>
    `;
    document.body.appendChild(linkTooltipEl);

    const x = event.clientX || event.pageX;
    const y = event.clientY || event.pageY;
    linkTooltipEl.style.left = (x + 16) + 'px';
    linkTooltipEl.style.top = (y - 10) + 'px';
}

function hideLinkTooltip() {
    if (linkTooltipEl) {
        linkTooltipEl.remove();
        linkTooltipEl = null;
    }
}

function autoFitZoom() {
    if (!currentData || !currentData.nodes.length || !window._graphZoom) return;

    const pos = {};
    const container = document.getElementById('graph-container');
    const W = container.clientWidth;
    const H = container.clientHeight;

    Object.values(computeLayout(currentData)).forEach(p => {
        pos[Object.keys(pos).length] = p;
    });

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    Object.values(pos).forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x + p.w > maxX) maxX = p.x + p.w;
        if (p.y < minY) minY = p.y;
        if (p.y + p.h > maxY) maxY = p.y + p.h;
    });

    if (minX === Infinity) return;

    const contentW = maxX - minX + 60;
    const contentH = maxY - minY + 60;
    const scaleX = W / contentW;
    const scaleY = H / contentH;
    const s = Math.max(Math.min(scaleX, scaleY, 1.2), 0.65) * 0.85;

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const t = d3.zoomIdentity
        .translate(W / 2, H / 2)
        .scale(s)
        .translate(-cx, -cy);

    svg.transition().duration(600).call(window._graphZoom.transform, t);
}

function getChainMarkerId(color) {
    const existing = document.getElementById(`chain-arrow-${color.replace('#', '')}`);
    if (existing) return `url(#chain-arrow-${color.replace('#', '')})`;

    defs.append('marker')
        .attr('id', `chain-arrow-${color.replace('#', '')}`)
        .attr('viewBox', '0 -7 18 14')
        .attr('refX', 16.5)
        .attr('refY', 0)
        .attr('markerWidth', 18)
        .attr('markerHeight', 18)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-7L18,0L0,7Z')
        .attr('fill', color);

    return `url(#chain-arrow-${color.replace('#', '')})`;
}

function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4;
        }
        h /= 6;
    }
    return [h * 360, s, l];
}

function hslToHex(h, s, l) {
    h /= 360;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const to = x => Math.round(Math.max(0, Math.min(255, x * 255))).toString(16).padStart(2, '0');
    return '#' + to(r) + to(g) + to(b);
}

function varyColor(hex, i, n) {
    if (n <= 1 || !hex) return hex;
    const [h, s, l] = hexToHsl(hex);
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    const nl = Math.min(0.82, Math.max(0.3, l + t * 0.32));
    const ns = Math.min(0.95, Math.max(0.35, s - Math.abs(t) * 0.2));
    return hslToHex(h, ns, nl);
}

function getFlowArrowId(color, tag) {
    const id = `flow-arrow-${tag}`;
    if (document.getElementById(id)) return id;
    defs.append('marker')
        .attr('id', id)
        .attr('viewBox', '0 -8 20 16')
        .attr('refX', 18)
        .attr('refY', 0)
        .attr('markerWidth', 20)
        .attr('markerHeight', 20)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-8L20,0L0,8Z')
        .attr('fill', color);
    return id;
}

function updateLinks(data, pos) {
    linkGroup.selectAll('path').each(function () {
        const pathData = d3.select(this).attr('d');
        if (!pathData) return;
    });
}

function highlightNode(d) {
    const conn = new Set(d.connections); conn.add(d.id);

    nodeGroup.selectAll('g').attr('opacity', function (n) {
        return conn.has(n.id) ? 1 : 0.1;
    });

    linkGroup.selectAll('path').each(function () {
        const el = d3.select(this);
        const src = el.attr('data-source');
        const tgt = el.attr('data-target');
        const isConn = src === d.id || tgt === d.id;
        el.attr('stroke-opacity', isConn ? 0.95 : 0.04)
          .attr('stroke-width', isConn ? 4.5 : 1);
    });

    linkGroup.selectAll('rect').attr('opacity', function () {
        return 0.2;
    });

    linkGroup.selectAll('text').attr('opacity', function () {
        return 0.2;
    });
}

function resetHighlight() {
    nodeGroup.selectAll('g').attr('opacity', 1);
    linkGroup.selectAll('path').each(function () {
        const el = d3.select(this);
        el.attr('stroke-opacity', el.attr('data-default-opacity') || 0.4)
          .attr('stroke-width', el.attr('data-default-width') || 2);
    });
    linkGroup.selectAll('rect').attr('opacity', 1);
    linkGroup.selectAll('text').attr('opacity', 1);
}

function ensureEditorVisible() {
    const overlay = document.getElementById('editorOverlay');
    if (overlay.classList.contains('hidden')) {
        overlay.classList.remove('hidden');
        setTimeout(() => { if (editor) editor.refresh(); }, 320);
    }
}

let _highlightedLines = [];
let _editorMarks = [];

function highlightCodeLine(lineNum) {
    if (!editor || lineNum === undefined || lineNum === null) return;
    ensureEditorVisible();
    _highlightedLines.push(lineNum);
    editor.addLineClass(lineNum, 'background', 'highlight-line');
    editor.scrollIntoView({ line: lineNum, ch: 0 }, 80);
}

function highlightIdentifier(name, color) {
    if (!editor || !name) return;
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lineRe = new RegExp('\\b' + esc + '\\b', 'g');
    const lines = editor.getValue().split('\n');
    for (let i = 0; i < lines.length; i++) {
        let m;
        while ((m = lineRe.exec(lines[i])) !== null) {
            const mark = editor.markText(
                { line: i, ch: m.index },
                { line: i, ch: m.index + m[0].length },
                {
                    className: 'code-id-mark',
                    attributes: { style: 'background:' + color + '30;border-bottom:2px solid ' + color + ';border-radius:3px;font-weight:700;color:' + color }
                }
            );
            _editorMarks.push(mark);
        }
    }
}

function clearAllHighlights() {
    if (!editor) return;
    for (const line of _highlightedLines) {
        editor.removeLineClass(line, 'background', 'highlight-line');
    }
    _highlightedLines = [];
    for (const mark of _editorMarks) {
        try { mark.clear(); } catch (e) {}
    }
    _editorMarks = [];
}

function highlightNodeCode(d) {
    if (!d) return;
    if (d.line !== undefined) {
        highlightCodeLine(d.line);
    }
    highlightIdentifier(d.id, d.color);
}

function showNodeInfo(d) {
    selectedNode = d;
    const c = d.color;
    const chainC = chainColors[d.id] || '#666';
    const chains = buildChains(graphData);
    let chainIdx = -1;
    chains.forEach((ch, i) => { if (ch.includes(d.id)) chainIdx = i + 1; });

    const typeDescriptions = {
        variable: 'Una variable declarada con let, var, const, o su equivalente en el lenguaje.',
        function: 'Una función declarada que puede ser llamada desde otras partes del código.',
        class: 'Una clase, interfaz o trait que define la estructura de objetos.',
        parameter: 'Un parámetro recibido por una función para recibir datos de entrada.',
        property: 'Una propiedad o atributo de un objeto o clase.',
        method: 'Un método que se invoca en un objeto o clase (no declarado aquí).',
        constant: 'Una constante definida, generalmente en mayúsculas.',
        imported: 'Un módulo o librería importada desde archivos externos.',
        template: 'Un template o componente de plantilla.',
        default: 'Otro tipo de elemento del código.'
    };

    const description = typeDescriptions[d.type] || 'Elemento del código fuente.';

    document.getElementById('element-info').innerHTML = `
        <div class="info-content">
            <div class="info-row"><span class="info-label">Nombre:</span><span class="info-value" style="color:${c};font-weight:600;font-family:monospace;font-size:1rem">${d.id}</span></div>
            <div class="info-row"><span class="info-label">Tipo:</span><span class="info-value"><span class="connection-tag" style="background:${c}22;color:${c};border:1px solid ${c}55">${TYPE_LABELS[d.type]||d.type}</span></span></div>
            <div class="info-row"><span class="info-label">Línea:</span><span class="info-value" style="color:#888">Línea ${d.line!==undefined?d.line+1:'N/A'}</span></div>
            <div class="info-row"><span class="info-label">Cadena:</span><span class="info-value"><span class="connection-tag" style="background:${chainC}22;color:${chainC};border:1px solid ${chainC}55">Cadena ${chainIdx}</span></span></div>
            <div class="info-row" style="margin-top:8px"><span class="info-label">Descripción:</span></div>
            <div style="color:#aaa;font-size:0.85rem;line-height:1.4;margin-bottom:10px;font-style:italic">${description}</div>
            <div class="info-row"><span class="info-label">Código fuente:</span></div>
            <div style="background:#0d0d1a;border-radius:6px;padding:8px 12px;margin-top:4px;border:1px solid #0f3460"><span style="color:#666;font-size:0.8rem;font-family:monospace;word-break:break-all">${d.context||'N/A'}</span></div>
            <div class="info-row" style="margin-top:10px"><span class="info-label">Conexiones (${d.connections.length}):</span></div>
            <div class="connections-list">${d.connections.length>0?d.connections.map(cn=>{const nd=graphData.nodes.find(n=>n.id===cn);const cc=nd?nd.color:'#94a3b8';const tl=nd?TYPE_LABELS[nd.type]||nd.type:'';return `<span class="connection-tag" style="background:${cc}22;color:${cc};border:1px solid ${cc}55" title="${tl}">${cn}</span>`}).join(''):'<span style="color:#666">Sin conexiones directas</span>'}</div>
        </div>`;
}

function updateLegend() {
    const types = new Set(graphData.nodes.map(n => n.type));
    const chains = buildChains(graphData);
    let html = '';

    if (chains.length > 0 && chains.some(c => c.length > 1)) {
        html += '<div class="legend-section"><span class="legend-title">Cadenas de flujo:</span>';
        chains.forEach((ch, i) => {
            if (ch.length <= 1) return;
            const cc = chainColors[ch[0]] || '#666';
            const names = ch.slice(0, 4).join(' → ') + (ch.length > 4 ? '...' : '');
            html += `<div class="legend-item"><div class="legend-color" style="background:${cc}"></div><span style="color:${cc}">C${i + 1}: ${names}</span></div>`;
        });
        html += '</div>';
    }

    const typeDescriptions = {
        variable: 'Variables locales/globales',
        function: 'Funciones declaradas',
        class: 'Clases/Interfaces/Traits',
        parameter: 'Parámetros de funciones',
        property: 'Propiedades de objetos',
        method: 'Métodos invocados',
        constant: 'Constantes (CAPS)',
        imported: 'Módulos importados',
        template: 'Templates/Components',
        default: 'Otros elementos'
    };

    html += '<div class="legend-section"><span class="legend-title">Símbolos:</span>';
    html += Array.from(types).sort().map(t => {
        const icons = { variable: 'V', function: 'F', class: 'C', parameter: 'P', property: '·', method: 'M', constant: 'K', imported: 'I', template: 'T', default: '?' };
        const icon = icons[t] || '?';
        const desc = typeDescriptions[t] || TYPE_LABELS[t] || t;
        return `<div class="legend-item"><div class="legend-color" style="background:${COLORS[t]||COLORS.default};display:flex;align-items:center;justify-content:center;color:#fff;font-size:8px;font-weight:700">${icon}</div><span>${TYPE_LABELS[t]||t} <span style="color:#666;font-size:0.7rem">- ${desc}</span></span></div>`;
    }).join('');
    html += '</div>';

    const linkMeta = {
        uses: { color: '#00d9ff', label: 'Usa', style: 'solid' },
        calls: { color: '#ff4d6d', label: 'Llama', style: 'solid' },
        imports: { color: '#8b5cf6', label: 'Importa', style: 'dotted' },
        provides: { color: '#f72585', label: 'Provee', style: 'dotted' },
        defines: { color: '#ffd60a', label: 'Define', style: 'solid' },
        depends: { color: '#fb8500', label: 'Depende', style: 'dashed' },
        receives: { color: '#06d6a0', label: 'Recibe', style: 'dashed' },
        references: { color: '#3a86ff', label: 'Referencia', style: 'solid' },
    };
    const usedLinkTypes = new Set(graphData.links.map(l => l.linkType || 'uses'));
    const showAll = usedLinkTypes.size === 0;
    const relevant = showAll ? Object.keys(linkMeta) : Array.from(usedLinkTypes);

    html += '<div class="legend-section"><span class="legend-title">Rutas:</span>';
    html += relevant.map(lt => {
        const meta = linkMeta[lt] || linkMeta.uses;
        const dashStyle = meta.style === 'dashed' ? 'dashed' : meta.style === 'dotted' ? 'dotted' : 'solid';
        return `<div class="legend-item"><div class="legend-line" style="--line-color:${meta.color};border-top:2px ${dashStyle} ${meta.color}"></div><span>${meta.label}</span></div>`;
    }).join('');
    html += '<div class="legend-item"><div class="legend-line" style="--line-color:#8b8fa3;border-top:2px dashed #8b8fa3"></div><span>Enlace inverso (va hacia atrás)</span></div>';
    html += '<div class="legend-item"><div class="legend-color" style="background:#fbbf24"></div><span>Paso N: orden de ejecución principal</span></div>';
    html += '<div class="legend-item"><span style="color:#666;font-size:0.7rem">Los tonos varían para distinguir líneas paralelas</span></div>';
    html += '</div>';

    document.getElementById('legend').innerHTML = html;
}

function detectUnrecognizedBlocks(code, language) {
    const lines = code.split('\n');
    const unrecognized = [];
    const rules = analyzerRules[language] || analyzerRules.javascript;

    const recognizedPatterns = rules.map(r => r.regex);

    const ignorePatterns = [
        /^\s*[\{\}\[\]\(\)];?\s*$/,
        /^\s*(if|else|elseif|elsif|else if|while|for|foreach|do|switch|case|default|break|continue|return|throw|try|catch|finally|end|endif|endwhile|endforeach|endfor|endswitch)\b/,
        /^\s*(echo|print|var_dump|print_r|console\.log|fmt\.Print|println!|printf)\s*[\(;]/,
        /^\s*\$/,
        /^\s*<\/?[\w-]+/,
        /^\s*@(extends|section|endforeach|include|yield|csrf|verbatim|endsection|if|unless|foreach|can|else|unless|push|once|php)\b/,
        /^\s*\{/,
        /^\s*\}/,
        /^\s*\?>/,
        /^\s*<\?php/,
        /^\s*--/,
        /^\s*\/[\/\*]/,
        /^\s*#/,
        /^\s*\*/,
        /^\s*;?\s*$/,
        /^\s*(use|require|include|import|from|package)\s/,
        /^\s*(class|interface|trait|struct|enum|type|impl|fn|func|function|def|sub|function)\s/,
        /^\s*(const|let|var|static|final|public|private|protected|internal|mut|pub|readonly)\s/,
        /^\s*\w+\s*[=:]/,
        /^\s*\w+\s*\(/,
        /^\s*\w+\s*\)/,
        /^\s*\w+\s*\]/,
    ];

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.length < 2) return;

        for (const pattern of ignorePatterns) {
            if (pattern.test(trimmed)) return;
        }

        let isRecognized = false;
        for (const regex of recognizedPatterns) {
            const testRegex = new RegExp(regex.source, regex.flags);
            if (testRegex.test(trimmed)) {
                isRecognized = true;
                break;
            }
        }

        if (!isRecognized) {
            if (/[a-zA-Z_]\w*\s*\(/.test(trimmed) && !/^\s*(if|else|while|for|foreach|switch|case|return|echo|print)\b/.test(trimmed)) {
                unrecognized.push({
                    line: idx + 1,
                    content: trimmed.length > 80 ? trimmed.substring(0, 77) + '...' : trimmed,
                });
            }
        }
    });

    return unrecognized;
}

function updateUnrecognized(code, language) {
    const unrecognizedEl = document.getElementById('unrecognized-content');
    const blocks = detectUnrecognizedBlocks(code, language);

    if (blocks.length === 0) {
        unrecognizedEl.innerHTML = '<p style="color: #34d399; font-size: 0.9rem;">✓ Todo el código fue reconocido</p>';
        return;
    }

    unrecognizedEl.innerHTML = `
        <div style="margin-bottom: 10px; font-size: 0.8rem; color: #ff6b6b;">
            ${blocks.length} bloque(s) no reconocido(s):
        </div>
        <div class="unrecognized-list">
            ${blocks.map(b => `
                <div class="unrecognized-item">
                    <span class="line-num">L${b.line}</span>${b.content}
                </div>
            `).join('')}
        </div>
    `;
}

function analyze() {
    const code = editor.getValue();
    const lang = document.getElementById('language').value;

    const langMap = {
        'application/x-httpd-php': 'php',
        'text/typescript': 'typescript',
        'text/x-csharp': 'text/x-csharp',
        'text/x-csrc': 'text/x-csrc',
        'text/x-c++src': 'text/x-c++src',
        'text/x-java': 'java',
        'text/htmlmixed': 'text/htmlmixed',
        'text/css': 'text/css',
        'text/x-sql': 'sql',
        'text/x-htmlembedded': 'text/x-htmlembedded',
    };
    const analyzerLang = langMap[lang] || lang;

    if (code.trim()) {
        const data = analyzeCode(code, analyzerLang);
        updateGraph(data);
        updateUnrecognized(code, analyzerLang);
    } else {
        updateGraph({ nodes: [], links: [] });
        document.getElementById('unrecognized-content').innerHTML = '<p class="hint">Los bloques sin analizar aparecerán aquí</p>';
    }
}

function init() {
    const samples = {
        'text/x-php': `<?php\n// Ejemplo PHP + HTML\n\nclass Database {\n    private $host = "localhost";\n    private $user = "root";\n    private $conn;\n\n    function connect() {\n        $this->conn = new mysqli($this->host, $this->user);\n        return $this->conn;\n    }\n\n    function query($sql) {\n        return $this->conn->query($sql);\n    }\n}\n\n$db = new Database();\n$conn = $db->connect();\n$result = $db->query("SELECT * FROM users");\n\nwhile ($row = $result->fetch_assoc()) {\n    echo $row['name'];\n}\n?>`,
        javascript: `// Ejemplo JavaScript\nimport axios from 'axios';\nimport { useState } from 'react';\n\nconst API_URL = "https://api.example.com";\n\nfunction fetchData(url) {\n    const response = axios.get(url);\n    return response.data;\n}\n\nconst processData = (data) => {\n    return data.map(item => item.value * 2);\n};\n\nasync function main() {\n    const raw = await fetchData(API_URL);\n    const result = processData(raw);\n    console.log(result);\n}\n\nmain();`,
        python: `# Ejemplo Python\nimport os\nimport json\nfrom datetime import datetime\n\nclass DataProcessor:\n    def __init__(self, path):\n        self.path = path\n        self.data = []\n\n    def load(self):\n        with open(self.path) as f:\n            self.data = json.load(f)\n\n    def process(self):\n        return [self.transform(item) for item in self.data]\n\n    def transform(self, item):\n        return {**item, 'processed': True}\n\nprocessor = DataProcessor("data.json")\nprocessor.load()\nresult = processor.process()\nprint(len(result))`,
        ruby: `# Ejemplo Ruby\nclass User\n  attr_accessor :name, :email\n\n  def initialize(name, email)\n    @name = name\n    @email = email\n  end\n\n  def greet\n    puts "Hola, soy #{@name}"\n  end\nend\n\nrequire 'json'\nrequire_relative 'helpers'\n\nusers = [User.new("Ana", "ana@test.com")]\nusers.each(&:greet)`,
        go: `package main\n\nimport (\n    "fmt"\n    "net/http"\n    "encoding/json"\n)\n\ntype Response struct {\n    Status  string \`json:"status"\`\n    Message string \`json:"message"\`\n}\n\nfunc handler(w http.ResponseWriter, r *http.Request) {\n    resp := Response{Status: "ok", Message: "Hello"}\n    json.NewEncoder(w).Encode(resp)\n}\n\nfunc main() {\n    http.HandleFunc("/", handler)\n    fmt.Println("Server started")\n    http.ListenAndServe(":8080", nil)\n}`,
        rust: `use std::collections::HashMap;\nuse std::io;\n\nstruct Config {\n    host: String,\n    port: u16,\n}\n\nimpl Config {\n    fn new(host: &str, port: u16) -> Self {\n        Config {\n            host: host.to_string(),\n            port,\n        }\n    }\n\n    fn connect(&self) -> Result<(), Box<dyn std::error::Error>> {\n        println!("Connecting to {}:{}", self.host, self.port);\n        Ok(())\n    }\n}\n\nfn main() {\n    let config = Config::new("localhost", 8080);\n    let mut map = HashMap::new();\n    map.insert("key", "value");\n    config.connect().unwrap();\n}`,
        swift: `import Foundation\nimport UIKit\n\nclass NetworkManager {\n    static let shared = NetworkManager()\n    private var session: URLSession\n\n    init() {\n        self.session = URLSession.shared\n    }\n\n    func fetchData(from url: URL, completion: @escaping (Data?, Error?) -> Void) {\n        let task = session.dataTask(with: url) { data, response, error in\n            completion(data, error)\n        }\n        task.resume()\n    }\n}\n\nstruct User: Codable {\n    let name: String\n    let email: String\n}\n\nlet manager = NetworkManager.shared\nlet url = URL(string: "https://api.example.com/users")!`,
        kotlin: `import kotlinx.coroutines.*\nimport io.ktor.client.*\nimport io.ktor.client.engine.cio.*\n\nclass AppViewModel(private val repo: Repository) : ViewModel() {\n    private val _state = MutableStateFlow<List<Item>>(emptyList())\n    val state: StateFlow<List<Item>> = _state\n\n    fun loadData() {\n        viewModelScope.launch {\n            val items = repo.getItems()\n            _state.value = items\n        }\n    }\n}\n\ndata class Item(val id: Int, val name: String)\ninterface Repository {\n    suspend fun getItems(): List<Item>\n}`,
        java: `import java.util.ArrayList;\nimport java.util.HashMap;\nimport java.util.stream.Collectors;\n\npublic class UserService {\n    private HashMap<String, User> users;\n\n    public UserService() {\n        this.users = new HashMap<>();\n    }\n\n    public void addUser(String id, String name) {\n        User user = new User(id, name);\n        users.put(id, user);\n    }\n\n    public User getUser(String id) {\n        return users.get(id);\n    }\n\n    public ArrayList<User> getAllUsers() {\n        return new ArrayList<>(users.values());\n    }\n}`,
        'text/x-csharp': `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nnamespace MyApp\n{\n    public class WeatherService\n    {\n        private readonly HttpClient _client;\n\n        public WeatherService(HttpClient client)\n        {\n            _client = client;\n        }\n\n        public async Task<WeatherData> GetWeather(string city)\n        {\n            var response = await _client.GetAsync($"/api/weather/{city}");\n            var data = await response.Content.ReadFromJsonAsync<WeatherData>();\n            return data;\n        }\n    }\n\n    public class WeatherData\n    {\n        public string City { get; set; }\n        public double Temperature { get; set; }\n    }\n}`,
        'text/x-csrc': `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\ntypedef struct {\n    char name[50];\n    int age;\n} Person;\n\nvoid printPerson(Person *p) {\n    printf("Name: %s, Age: %d\\n", p->name, p->age);\n}\n\nPerson* createPerson(const char *name, int age) {\n    Person *p = malloc(sizeof(Person));\n    strcpy(p->name, name);\n    p->age = age;\n    return p;\n}\n\nint main() {\n    Person *p = createPerson("Carlos", 25);\n    printPerson(p);\n    free(p);\n    return 0;\n}`,
        'text/x-c++src': `#include <iostream>\n#include <vector>\n#include <string>\n#include <memory>\n\nclass Animal {\npublic:\n    virtual void speak() = 0;\n    virtual ~Animal() = default;\n};\n\nclass Dog : public Animal {\n    std::string name;\npublic:\n    Dog(const std::string& n) : name(n) {}\n    void speak() override {\n        std::cout << name << " says Woof!" << std::endl;\n    }\n};\n\nint main() {\n    std::vector<std::unique_ptr<Animal>> animals;\n    animals.push_back(std::make_unique<Dog>("Rex"));\n    for (const auto& a : animals) {\n        a->speak();\n    }\n    return 0;\n}`,
        r: `library(ggplot2)\nlibrary(dplyr)\nlibrary(tidyr)\n\nread_data <- function(path) {\n  data <- read.csv(path)\n  return(data)\n}\n\nprocess_data <- function(df) {\n  result <- df %>%\n    group_by(category) %>%\n    summarise(mean_val = mean(value)) %>%\n    arrange(desc(mean_val))\n  return(result)\n}\n\nplot_chart <- function(df) {\n  ggplot(df, aes(x = category, y = mean_val)) +\n    geom_bar(stat = "identity") +\n    theme_minimal()\n}\n\ndata <- read_data("data.csv")\nprocessed <- process_data(data)\nplot_chart(processed)`,
        sql: `CREATE TABLE users (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(255) UNIQUE,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE orders (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    user_id INT,\n    total DECIMAL(10,2),\n    FOREIGN KEY (user_id) REFERENCES users(id)\n);\n\nDELIMITER //\nCREATE FUNCTION get_user_orders(uid INT)\nRETURNS INT\nBEGIN\n    DECLARE order_count INT;\n    SELECT COUNT(*) INTO order_count FROM orders WHERE user_id = uid;\n    RETURN order_count;\nEND //\nDELIMITER ;\n\nSELECT u.name, get_user_orders(u.id) as order_count\nFROM users u;`,
        bash: `#!/bin/bash\n\nCONFIG_FILE="/etc/app/config"\nLOG_DIR="/var/log/app"\nMAX_RETRIES=3\n\ndebug_log() {\n    local msg="$1"\n    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $msg" >> "$LOG_DIR/debug.log"\n}\n\nload_config() {\n    source "$CONFIG_FILE"\n    export DB_HOST DB_PORT DB_NAME\n}\n\nconnect_db() {\n    local host=$1\n    local port=$2\n    local retries=0\n    while [ $retries -lt $MAX_RETRIES ]; do\n        if mysql -h "$host" -P "$port" -e "SELECT 1"; then\n            echo "Connected!"\n            return 0\n        fi\n        retries=$((retries + 1))\n        sleep 2\n    done\n    return 1\n}\n\nload_config\nconnect_db "$DB_HOST" "$DB_PORT"`,
        perl: `use strict;\nuse warnings;\nuse JSON;\nuse LWP::UserAgent;\n\nmy $ua = LWP::UserAgent->new;\nmy $url = "https://api.example.com/data";\n\nsub fetch_data {\n    my ($url) = @_;\n    my $response = $ua->get($url);\n    if ($response->is_success) {\n        return decode_json($response->decoded_content);\n    }\n    die "Failed: " . $response->status_line;\n}\n\nsub process_items {\n    my ($items) = @_;\n    my @results;\n    foreach my $item (@$items) {\n        push @results, { %$item, processed => 1 };\n    }\n    return \\@results;\n}\n\nmy $data = fetch_data($url);\nmy $processed = process_items($data->{items});`,
        lua: `local http = require("socket.http")\nlocal json = require("dkjson")\n\nlocal Config = {\n    host = "localhost",\n    port = 8080,\n    timeout = 30\n}\n\nfunction fetchData(url)\n    local response, status = http.request(url)\n    if status == 200 then\n        return json.decode(response)\n    end\n    return nil, "Error: " .. tostring(status)\nend\n\nfunction processData(items)\n    local result = {}\n    for i, item in ipairs(items) do\n        result[i] = {\n            id = item.id,\n            name = item.name:upper(),\n            processed = true\n        }\n    end\n    return result\nend\n\nlocal data = fetchData("http://" .. Config.host .. ":" .. Config.port .. "/data")\nif data then\n    local processed = processData(data.items)\n    print("Processed " .. #processed .. " items")\nend`,
        haskell: `module Main where\n\nimport qualified Data.Map as Map\nimport System.IO\n\ndata Person = Person\n    { name :: String\n    , age :: Int\n    , email :: String\n    } deriving (Show, Eq)\n\nclass Describable a where\n    describe :: a -> String\n\ninstance Describable Person where\n    describe p = name p ++ " (" ++ show (age p) ++ ")"\n\nfetchData :: String -> IO String\nfetchData url = do\n    response <- readFile url\n    return response\n\nprocessItems :: [Person] -> [Person]\nprocessItems = map (\\p -> p { age = age p + 1 })\n\nmain :: IO ()\nmain = do\n    let people = [Person "Ana" 25 "ana@test.com", Person "Bob" 30 "bob@test.com"]\n    let processed = processItems people\n    mapM_ (putStrLn . describe) processed`,
        dart: `import 'dart:convert';\nimport 'package:http/http.dart' as http;\n\nclass ApiResponse {\n  final int status;\n  final String message;\n  final List<dynamic> data;\n\n  ApiResponse({required this.status, required this.message, required this.data});\n\n  factory ApiResponse.fromJson(Map<String, dynamic> json) {\n    return ApiResponse(\n      status: json['status'],\n      message: json['message'],\n      data: json['data'],\n    );\n  }\n}\n\nFuture<ApiResponse> fetchData(String url) async {\n  final response = await http.get(Uri.parse(url));\n  if (response.statusCode == 200) {\n    return ApiResponse.fromJson(jsonDecode(response.body));\n  }\n  throw Exception('Failed to load');\n}\n\nvoid main() async {\n  final api = fetchData("https://api.example.com");\n  final result = await api;\n  print(result.message);\n}`,
        shell: `#!/bin/bash\n\nCONFIG_FILE="/etc/app/config"\nLOG_DIR="/var/log/app"\nMAX_RETRIES=3\n\ndebug_log() {\n    local msg="$1"\n    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $msg" >> "$LOG_DIR/debug.log"\n}\n\nload_config() {\n    source "$CONFIG_FILE"\n    export DB_HOST DB_PORT DB_NAME\n}\n\nconnect_db() {\n    local host=$1\n    local port=$2\n    local retries=0\n    while [ $retries -lt $MAX_RETRIES ]; do\n        if mysql -h "$host" -P "$port" -e "SELECT 1"; then\n            echo "Connected!"\n            return 0\n        fi\n        retries=$((retries + 1))\n        sleep 2\n    done\n    return 1\n}\n\nload_config\nconnect_db "$DB_HOST" "$DB_PORT"`,
        htmlembedded: `@extends('layouts.app')\n\n@section('content')\n<div class="container">\n    <h1>{{ $title }}</h1>\n    @foreach($users as $user)\n        <div class="user-card">\n            <h2>{{ $user->name }}</h2>\n            <p>{{ $user->email }}</p>\n            @if($user->isActive)\n                <span class="badge">Activo</span>\n            @endif\n        </div>\n    @endforeach\n    @include('partials.pagination')\n@endsection\n\n<script>\n    document.querySelectorAll('.user-card').forEach(card => {\n        card.addEventListener('click', function() {\n            this.classList.toggle('expanded');\n        });\n    });\n</script>`,
        'text/x-htmlembedded': `{% extends "base.html" %}\n\n{% block title %}{{ page_title }}{% endblock %}\n\n{% block content %}\n<div class="container">\n    <h1>{{ page_title }}</h1>\n    {% for item in items %}\n        <div class="item">\n            {{ item.name }}\n            {% if item.featured %}\n                <span class="featured">Destacado</span>\n            {% endif %}\n        </div>\n    {% empty %}\n        <p>No hay elementos</p>\n    {% endfor %}\n\n    {% include "partials/sidebar.html" with {"categories": categories} %}\n</div>\n\n<script>\n    const items = {{ items_json|safe }};\n    console.log(items);\n</script>\n{% endblock %}`,
        vue: `<template>\n  <div class="app">\n    <h1>{{ message }}</h1>\n    <UserList :users="users" @select="handleSelect" />\n  </div>\n</template>\n\n<script>\nimport { ref, onMounted } from 'vue';\nimport UserList from './components/UserList.vue';\nimport { fetchUsers } from './api';\n\nexport default {\n  components: { UserList },\n  setup() {\n    const message = ref('Hello');\n    const users = ref([]);\n\n    onMounted(async () => {\n      users.value = await fetchUsers();\n    });\n\n    const handleSelect = (user) => {\n      console.log(user);\n    };\n\n    return { message, users, handleSelect };\n  }\n};\n</script>`,
        jsx: `import React, { useState, useEffect } from 'react';\nimport { fetchData } from './api';\nimport UserCard from './UserCard';\n\nconst App = () => {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const loadUsers = async () => {\n      const data = await fetchData('/api/users');\n      setUsers(data);\n      setLoading(false);\n    };\n    loadUsers();\n  }, []);\n\n  const handleDelete = (id) => {\n    setUsers(users.filter(u => u.id !== id));\n  };\n\n  if (loading) return <div className="spinner">Loading...</div>;\n\n  return (\n    <div className="app">\n      <h1>Users</h1>\n      <div className="grid">\n        {users.map(user => (\n          <UserCard key={user.id} user={user} onDelete={handleDelete} />\n        ))}\n      </div>\n    </div>\n  );\n};\n\nexport default App;`,
        'text/htmlmixed': `<!DOCTYPE html>\n<html lang="es">\n<head>\n    <meta charset="UTF-8">\n    <title>Mi App</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <header class="main-header">\n        <h1 id="title">Hola Mundo</h1>\n        <nav id="menu">\n            <a href="/" class="nav-link">Inicio</a>\n            <a href="/about" class="nav-link">About</a>\n        </nav>\n    </header>\n    <main id="content">\n        <div class="card" data-id="1">\n            <h2>Card Title</h2>\n            <p>Card content here</p>\n            <button onclick="handleClick()">Click me</button>\n        </div>\n    </main>\n    <script src="app.js"><\/script>\n</body>\n</html>`,
        'text/css': `/* Variables CSS */\n:root {\n    --primary: #00d9ff;\n    --secondary: #00ff88;\n    --bg-dark: #0d0d1a;\n    --text-light: #eaeaea;\n}\n\n/* Reset */\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\nbody {\n    font-family: 'Segoe UI', sans-serif;\n    background: var(--bg-dark);\n    color: var(--text-light);\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 20px;\n}\n\n.header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 15px 0;\n    border-bottom: 1px solid var(--primary);\n}\n\n.btn {\n    padding: 10px 20px;\n    background: linear-gradient(135deg, var(--primary), var(--secondary));\n    border: none;\n    border-radius: 8px;\n    cursor: pointer;\n    transition: transform 0.2s;\n}\n\n.btn:hover {\n    transform: translateY(-2px);\n}\n\n.card {\n    background: rgba(22, 33, 62, 0.8);\n    border-radius: 12px;\n    padding: 20px;\n    margin: 10px 0;\n}\n\n@media (max-width: 768px) {\n    .container { padding: 10px; }\n    .header { flex-direction: column; }\n}`,
    };

    const langSelect = document.getElementById('language');
    const currentLang = langSelect.value;

    const sampleMap = {
        'application/x-httpd-php': 'text/x-php',
        'text/typescript': 'typescript',
        'shell': 'shell',
    };
    const sampleLang = sampleMap[currentLang] || currentLang;

    editor = CodeMirror(document.getElementById('editor'), {
        value: samples[sampleLang] || samples.javascript,
        mode: currentLang === 'text/typescript' ? 'text/typescript' : currentLang,
        theme: 'dracula',
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        tabSize: 2,
        lineWrapping: true,
        htmlMode: true,
    });

    initGraph();
    renderZoneFilters();

    document.getElementById('analyzeBtn').addEventListener('click', analyze);

    langSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        const sampleKey = sampleMap[mode] || mode;
        editor.setOption('mode', mode);
        if (samples[sampleKey]) editor.setValue(samples[sampleKey]);
        else if (samples[mode]) editor.setValue(samples[mode]);
        analyze();
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); analyze(); }
    });

    let debounceTimer;
    editor.on('change', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(analyze, 600); });
    setTimeout(analyze, 300);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    const c = document.getElementById('graph-container');
    svg.attr('width', c.clientWidth).attr('height', c.clientHeight);
    if (currentData && currentData.nodes.length) {
        updateGraph(fullData || currentData);
    }
});
